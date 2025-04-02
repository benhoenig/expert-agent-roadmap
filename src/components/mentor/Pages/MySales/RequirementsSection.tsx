import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DashboardMetadata, SalesProgressData } from "./types";
import { isProgressDataLoading, getSalesProgressData } from "./utils";

interface RequirementsSectionProps {
  salesId: number;
  selectedWeek: number;
  metadata: DashboardMetadata | null;
  salesProgressData: Record<string, SalesProgressData>;
  isProgressLoading: Record<string, boolean>;
  getCurrentTarget: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => number;
}

export function RequirementsSection({
  salesId,
  selectedWeek,
  metadata,
  salesProgressData,
  isProgressLoading,
  getCurrentTarget
}: RequirementsSectionProps) {
  const loading = isProgressDataLoading(salesId, selectedWeek, isProgressLoading);

  // Use useMemo to prevent redundant calculations and renders
  const requirementsContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
        </div>
      );
    }

    if (!metadata?.mentorDashboard_requirement_masterData || 
        metadata.mentorDashboard_requirement_masterData.length === 0) {
      return (
        <div className="py-4 text-center text-muted-foreground">
          No requirements data available
        </div>
      );
    }

    return (
      <>
        {metadata.mentorDashboard_requirement_masterData.map((req, index) => {
          // Find the corresponding requirement progress if it exists
          const reqProgress = getSalesProgressData(salesId, selectedWeek, salesProgressData)?.requirement_progress1?.find(
            r => r._requirement[0]?.requirement_name === req.requirement_name
          );
          
          // Use the actual count if available, otherwise use 0
          const count = reqProgress?.requirement_progress_count || 0;
          
          // Get target value from getCurrentTarget
          // We need to find the correct requirement ID
          const requirementId = reqProgress?.requirement_progress_requirement_id || index + 1; // Add 1 because API IDs start at 1
          
          // Since getCurrentTarget already adds 1 to the ID, we need to subtract 1 here
          const target = getCurrentTarget('requirement', requirementId - 1, salesId, selectedWeek);
          const hasTarget = target > 0;
          const isCompleted = hasTarget ? count >= target : count > 0;
          
          return (
            <div key={index} className="flex items-center justify-between">
              <span>{req.requirement_name}</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${
                    isCompleted
                      ? "bg-gold-50 text-gold-900 hover:bg-gold-100"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {count}/{target}
                </Badge>
                <span className="text-muted-foreground text-sm">
                  {hasTarget ? `/${target}` : '/ N/A'}
                </span>
              </div>
            </div>
          );
        })}
      </>
    );
  }, [loading, metadata, salesId, selectedWeek, salesProgressData, getCurrentTarget]);

  return (
    <div className="mb-6">
      <h4 className="text-md font-medium mb-3">Requirements</h4>
      <div className="space-y-2">
        {requirementsContent}
      </div>
    </div>
  );
} 