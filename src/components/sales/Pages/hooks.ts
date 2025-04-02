// Types for week data
export interface WeekData {
  isLoaded: boolean;
  isLoading: boolean;
  progressData?: ProgressData[];
  targetData?: TargetData[];
  comment?: string | null;
}

// Types for progress data
export interface ProgressData {
  kpi_id: number;
  requirement_id: number;
  count: number;
  is_complete: boolean;
}

// Types for target data
export interface TargetData {
  kpi_id: number;
  requirement_id: number;
  target_count: number;
}

// Types for metadata
export interface Metadata {
  mentorDashboard_actionKpi_masterData: KpiData[];
  mentorDashboard_skillsetKpi_masterData: KpiData[];
  mentorDashboard_requirement_masterData: RequirementData[];
}

// Types for KPI data
export interface KpiData {
  kpi_id: number;
  kpi_name: string;
}

// Types for requirement data
export interface RequirementData {
  requirement_id: number;
  requirement_name: string;
}

// Hook to fetch metadata (mock implementation)
export const useMetadata = () => {
  // Mock implementation
  return {
    metadata: null,
    isLoading: false,
    isError: false
  };
};

// Hook to fetch week data (mock implementation)
export const useWeekData = (weekNumber: number) => {
  // Mock implementation
  return {
    weekData: null,
    isLoading: false,
    isError: false
  };
}; 