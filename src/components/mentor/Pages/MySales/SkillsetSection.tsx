import { Badge } from "@/components/ui/badge";
import { DashboardMetadata, SalesProgressData } from "./types";
import { isProgressDataLoading, getSalesProgressData, formatSkillPercentage } from "./utils";

interface SkillsetSectionProps {
  salesId: number;
  selectedWeek: number;
  metadata: DashboardMetadata | null;
  salesProgressData: Record<string, SalesProgressData>;
  isProgressLoading: Record<string, boolean>;
}

export function SkillsetSection({
  salesId,
  selectedWeek,
  metadata,
  salesProgressData,
  isProgressLoading
}: SkillsetSectionProps) {
  const loading = isProgressDataLoading(salesId, selectedWeek, isProgressLoading);

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
          <tbody className="divide-y">
            {/* Loading state */}
            {loading && (
              <tr>
                <td colSpan={3} className="py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
                  </div>
                </td>
              </tr>
            )}
            
            {/* Display real skillset data */}
            {!loading && 
             metadata?.mentorDashboard_skillsetKpi_masterData?.map((skillset, index) => {
              // Find the corresponding skill score from the API
              const skillScore = getSalesProgressData(salesId, selectedWeek, salesProgressData)?.kpi_skillset_progress_max?.find(
                s => s.kpi_skillset_progress_kpi_id === index + 8 // Add 8 because the IDs start from 8 in the sample data
              );
              
              // Use 0 if no score is found
              const score = skillScore?.kpi_skillset_progress_total_score || 0;
              // For demo, use 70 as the mock target to show the color change logic
              const mockTarget = 70;
              const isTargetMet = score >= mockTarget;
              
              return (
                <tr key={index}>
                  <td className="py-2 px-2">{skillset.kpi_name}</td>
                  <td className="text-center py-2 px-2">
                    <Badge className={isTargetMet ? "bg-green-100 text-green-800" : "bg-gold-100 text-gold-800"}>
                      {formatSkillPercentage(score / 10)}
                    </Badge>
                  </td>
                  <td className="text-center py-2 px-2 text-muted-foreground text-sm">
                    N/A
                  </td>
                </tr>
              );
            })}
            
            {/* Show a message if no metadata is available */}
            {!loading && 
              (!metadata?.mentorDashboard_skillsetKpi_masterData || 
              metadata.mentorDashboard_skillsetKpi_masterData.length === 0) && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-muted-foreground">
                  No skillset data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 