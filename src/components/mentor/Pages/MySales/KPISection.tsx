import { Progress } from "@/components/ui/progress";
import { DashboardMetadata, SalesProgressData } from "./types";
import { isProgressDataLoading, getSalesProgressData } from "./utils";

interface KPISectionProps {
  salesId: number;
  selectedWeek: number;
  metadata: DashboardMetadata | null;
  salesProgressData: Record<string, SalesProgressData>;
  isProgressLoading: Record<string, boolean>;
}

export function KPISection({
  salesId,
  selectedWeek,
  metadata,
  salesProgressData,
  isProgressLoading
}: KPISectionProps) {
  const loading = isProgressDataLoading(salesId, selectedWeek, isProgressLoading);

  return (
    <div className="mb-6">
      <h4 className="text-md font-medium mb-3">KPI</h4>
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
          <div className="col-span-4">Action</div>
          <div className="col-span-5">Progress</div>
          <div className="col-span-3">Completion</div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        )}
        
        {/* Display real KPI action data */}
        {!loading && (
          <>
            {metadata?.mentorDashboard_actionKpi_masterData?.map((kpi, index) => {
              // Find the corresponding progress data if it exists
              const actionProgress = getSalesProgressData(salesId, selectedWeek, salesProgressData)?.result1?.find(
                action => action._kpi.kpi_name === kpi.kpi_name
              );
              
              // Use the actual value if available, otherwise use 0
              const count = actionProgress?.kpi_action_progress_count || 0;
              // Default target value - for now, display N/A until the API provides target values
              const hasTarget = false; // This will be true when API provides target values
              // For demo, use 50 as the mock target to show the color change logic
              const mockTarget = 50;
              const isTargetMet = count >= mockTarget;
              
              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">{kpi.kpi_name}</div>
                  <div className="col-span-5">
                    {hasTarget ? (
                      <Progress 
                        value={(count / 100) * 100} 
                        className={`h-2 ${isTargetMet ? 'bg-secondary [&>div]:bg-green-500' : 'bg-secondary [&>div]:bg-gold-500'}`}
                      />
                    ) : (
                      <div className="h-2 w-full bg-gray-100 rounded-full">
                        <div 
                          className={`h-full rounded-full ${isTargetMet ? 'bg-green-500' : 'bg-gold-500'}`}
                          style={{ width: `${count}%`, maxWidth: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-span-3 text-sm">
                    {count} {hasTarget ? '/ 100' : '/ N/A'}
                  </div>
                </div>
              );
            })}
            
            {/* Show a message if no metadata is available */}
            {(!metadata?.mentorDashboard_actionKpi_masterData || 
              metadata.mentorDashboard_actionKpi_masterData.length === 0) && (
              <div className="py-4 text-center text-muted-foreground">
                No KPI data available
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 