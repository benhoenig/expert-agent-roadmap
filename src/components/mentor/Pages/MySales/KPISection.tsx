import { useMemo } from "react";
import { DashboardMetadata, SalesProgressData } from "./types";
import { isProgressDataLoading, getSalesProgressData } from "./utils";

interface KPISectionProps {
  salesId: number;
  selectedWeek: number;
  metadata: DashboardMetadata | null;
  salesProgressData: Record<string, SalesProgressData>;
  isProgressLoading: Record<string, boolean>;
  getCurrentTarget: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => number;
}

export function KPISection({
  salesId,
  selectedWeek,
  metadata,
  salesProgressData,
  isProgressLoading,
  getCurrentTarget
}: KPISectionProps) {
  const loading = isProgressDataLoading(salesId, selectedWeek, isProgressLoading);
  
  // Use useMemo to prevent redundant calculations and renders
  const kpiContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
        </div>
      );
    }
    
    if (!metadata?.mentorDashboard_actionKpi_masterData || 
        metadata.mentorDashboard_actionKpi_masterData.length === 0) {
      return (
        <div className="py-4 text-center text-muted-foreground">
          No KPI data available
        </div>
      );
    }
    
    return (
      <>
        {metadata.mentorDashboard_actionKpi_masterData.map((kpi, index) => {
          // Find the corresponding progress data if it exists
          const actionProgress = getSalesProgressData(salesId, selectedWeek, salesProgressData)?.result1?.find(
            action => action._kpi.kpi_name === kpi.kpi_name
          );
          
          // Use the actual value if available, otherwise use 0
          const count = actionProgress?.kpi_action_progress_count || 0;
          
          // Get the target value from the getCurrentTarget function
          // We need to use the actual KPI ID from the API response
          const kpiId = actionProgress?.kpi_action_progress_kpi_id || index + 1; // Add 1 because API IDs start at 1
          
          // Here we use kpiId-1 since getCurrentTarget already adds 1 inside
          const target = getCurrentTarget('action', kpiId-1, salesId, selectedWeek);
          const hasTarget = target > 0;
          const isTargetMet = hasTarget && count >= target;
          
          return (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-4">{kpi.kpi_name}</div>
              <div className="col-span-5">
                {hasTarget ? (
                  <div className="h-2 w-full bg-secondary rounded-full">
                    <div 
                      className={`h-full rounded-full ${isTargetMet ? 'bg-green-500' : 'bg-gold-500'}`}
                      style={{ width: `${Math.min((count / target) * 100, 100)}%` }}
                    />
                  </div>
                ) : (
                  <div className="h-2 w-full bg-gray-100 rounded-full">
                    <div 
                      className={`h-full rounded-full bg-gold-500`}
                      style={{ width: `${count}%`, maxWidth: '100%' }}
                    />
                  </div>
                )}
              </div>
              <div className="col-span-3 text-sm">
                {count} {hasTarget ? `/ ${target}` : '/ N/A'}
              </div>
            </div>
          );
        })}
      </>
    );
  }, [loading, metadata, salesId, selectedWeek, salesProgressData, getCurrentTarget]);

  return (
    <div className="mb-6">
      <h4 className="text-md font-medium mb-3">KPI & Actions</h4>
      <div className="space-y-4">
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
          <div className="col-span-4">Action</div>
          <div className="col-span-5">Progress</div>
          <div className="col-span-3">Completion</div>
        </div>
        
        {kpiContent}
      </div>
    </div>
  );
} 