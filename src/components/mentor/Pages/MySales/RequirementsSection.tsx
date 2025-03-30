import { Badge } from "@/components/ui/badge";
import { DashboardMetadata, SalesProgressData } from "./types";
import { isProgressDataLoading, getSalesProgressData } from "./utils";

interface RequirementsSectionProps {
  salesId: number;
  selectedWeek: number;
  metadata: DashboardMetadata | null;
  salesProgressData: Record<string, SalesProgressData>;
  isProgressLoading: Record<string, boolean>;
}

export function RequirementsSection({
  salesId,
  selectedWeek,
  metadata,
  salesProgressData,
  isProgressLoading
}: RequirementsSectionProps) {
  const loading = isProgressDataLoading(salesId, selectedWeek, isProgressLoading);

  return (
    <div className="mb-6">
      <h4 className="text-md font-medium mb-3">Requirements</h4>
      <div className="space-y-2">
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        )}
        
        {/* Display real requirement data */}
        {!loading && (
          <>
            {metadata?.mentorDashboard_requirement_masterData?.map((req, index) => {
              // Find the corresponding requirement progress if it exists
              const reqProgress = getSalesProgressData(salesId, selectedWeek, salesProgressData)?.requirement_progress1?.find(
                r => r._requirement[0]?.requirement_name === req.requirement_name
              );
              
              // Use the actual count if available, otherwise use 0
              const count = reqProgress?.requirement_progress_count || 0;
              // For demo, use 1 as the mock target to show the color change logic
              const mockTarget = 1;
              const isTargetMet = count >= mockTarget;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span>{req.requirement_name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={isTargetMet ? "bg-green-100 text-green-800" : "bg-gold-100 text-gold-800"}>
                      {count}
                    </Badge>
                    <span className="text-muted-foreground text-sm">/ N/A</span>
                  </div>
                </div>
              );
            })}
            
            {/* Show a message if no metadata is available */}
            {(!metadata?.mentorDashboard_requirement_masterData || 
              metadata.mentorDashboard_requirement_masterData.length === 0) && (
              <div className="py-4 text-center text-muted-foreground">
                No requirements data available
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 