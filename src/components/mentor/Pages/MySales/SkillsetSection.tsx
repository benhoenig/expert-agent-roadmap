import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { DashboardMetadata, SalesProgressData } from "./types";
import { isProgressDataLoading, getSalesProgressData, formatSkillPercentage } from "./utils";

interface SkillsetSectionProps {
  salesId: number;
  selectedWeek: number;
  metadata: DashboardMetadata | null;
  salesProgressData: Record<string, SalesProgressData>;
  isProgressLoading: Record<string, boolean>;
  getCurrentTarget: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => number;
}

export function SkillsetSection({
  salesId,
  selectedWeek,
  metadata,
  salesProgressData,
  isProgressLoading,
  getCurrentTarget
}: SkillsetSectionProps) {
  const loading = isProgressDataLoading(salesId, selectedWeek, isProgressLoading);
  
  // Use useMemo to prevent redundant calculations and renders
  const skillsetContent = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={3} className="py-4 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
            </div>
          </td>
        </tr>
      );
    }
    
    if (!metadata?.mentorDashboard_skillsetKpi_masterData || 
        metadata.mentorDashboard_skillsetKpi_masterData.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="py-4 text-center text-muted-foreground">
            No skillset data available
          </td>
        </tr>
      );
    }
    
    return metadata.mentorDashboard_skillsetKpi_masterData.map((skillset, index) => {
      // Find the corresponding skill score from the API
      // We need to add 8 to the index because skillset IDs in the API start from 8
      const skillScore = getSalesProgressData(salesId, selectedWeek, salesProgressData)?.kpi_skillset_progress_max?.find(
        s => s.kpi_skillset_progress_kpi_id === index + 8 // Add 8 because the IDs start from 8 in the API response
      );
      
      // Use 0 if no score is found
      const score = skillScore?.kpi_skillset_progress_total_score || 0;
      
      // Get target value from getCurrentTarget - pass salesId and weekNumber
      // We don't need to adjust the index here because getCurrentTarget already handles the +8 offset
      const target = getCurrentTarget('skillset', index, salesId, selectedWeek);
      const hasTarget = target > 0;
      const isTargetMet = hasTarget && score >= target;
      
      return (
        <tr key={index}>
          <td className="py-2 px-2">{skillset.kpi_name}</td>
          <td className="text-center py-2 px-2">
            <Badge className={isTargetMet ? "bg-green-100 text-green-800" : "bg-gold-100 text-gold-800"}>
              {formatSkillPercentage(score / 10)}
            </Badge>
          </td>
          <td className="text-center py-2 px-2 text-muted-foreground text-sm">
            {hasTarget ? formatSkillPercentage(target / 10) : 'N/A'}
          </td>
        </tr>
      );
    });
  }, [loading, metadata, salesId, selectedWeek, salesProgressData, getCurrentTarget]);

  return (
    <div className="mb-6">
      <h4 className="text-md font-medium mb-3">Skillsets</h4>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-medium text-muted-foreground">Skillset</th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground">Score</th>
              <th className="text-center py-2 px-2 font-medium text-muted-foreground">Target</th>
            </tr>
          </thead>
          <tbody>
            {skillsetContent}
          </tbody>
        </table>
      </div>
    </div>
  );
} 