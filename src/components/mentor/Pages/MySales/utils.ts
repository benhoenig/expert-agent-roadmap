import { format } from "date-fns";
import { SalesProgressData, DashboardMetadata } from "./types";

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();
};

export const formatDate = (dateString: string): string => {
  try {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || 'N/A';
  }
};

export const getProbationStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'ongoing':
      return 'bg-yellow-100 text-yellow-800';
    case 'passed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export const formatSkillPercentage = (score: number): string => {
  return `${Math.round((score / 10) * 100)}%`;
};

export const getSalesProgressData = (
  salesId: number, 
  weekNumber: number, 
  salesProgressData: Record<string, SalesProgressData>
): SalesProgressData | undefined => {
  const key = `${salesId}-${weekNumber}`;
  return salesProgressData[key];
};

export const isProgressDataLoading = (
  salesId: number, 
  weekNumber: number, 
  isProgressLoading: Record<string, boolean>
): boolean => {
  const key = `${salesId}-${weekNumber}`;
  return !!isProgressLoading[key];
};

export const getCompletedKPIsCount = (
  salesId: number, 
  weekNumber: number, 
  salesProgressData: Record<string, SalesProgressData>,
  getCurrentTarget?: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => number
): number => {
  const key = `${salesId}-${weekNumber}`;
  if (salesProgressData[key] && salesProgressData[key].result1) {
    // Count KPIs that meet their targets using real target values
    if (getCurrentTarget) {
      // Use actual targets from getCurrentTarget
      return salesProgressData[key].result1.filter(action => {
        const kpiId = action.kpi_action_progress_kpi_id - 1; // Subtract 1 because getCurrentTarget adds 1 inside
        const target = getCurrentTarget('action', kpiId, salesId, weekNumber);
        // Consider it complete only if there is a target set and it's met
        return target > 0 && action.kpi_action_progress_count >= target;
      }).length;
    } else {
      // Fallback to hardcoded value if getCurrentTarget not provided
      return salesProgressData[key].result1.filter(
        action => action.kpi_action_progress_count >= 50
      ).length;
    }
  }
  return 0;
};

export const getTotalKPIsCount = (
  salesId: number, 
  weekNumber: number, 
  salesProgressData: Record<string, SalesProgressData>,
  metadata: DashboardMetadata | null
): number => {
  const progressData = getSalesProgressData(salesId, weekNumber, salesProgressData);
  if (progressData && progressData.result1) {
    return progressData.result1.length;
  }
  
  // If no progress data yet, use metadata
  if (metadata?.mentorDashboard_actionKpi_masterData) {
    return metadata.mentorDashboard_actionKpi_masterData.length;
  }
  
  return 0;
};

export const getCompletedSkillsetsCount = (
  salesId: number, 
  weekNumber: number, 
  salesProgressData: Record<string, SalesProgressData>,
  getCurrentTarget?: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => number
): number => {
  const key = `${salesId}-${weekNumber}`;
  if (salesProgressData[key] && salesProgressData[key].kpi_skillset_progress_max) {
    // Count skillsets that meet their targets using real target values
    if (getCurrentTarget) {
      // Use actual targets from getCurrentTarget
      return salesProgressData[key].kpi_skillset_progress_max.filter(skillset => {
        // Skillset IDs start from 8, so we need to subtract 8 to get the index
        const skillsetId = skillset.kpi_skillset_progress_kpi_id - 8;
        const target = getCurrentTarget('skillset', skillsetId, salesId, weekNumber);
        // Consider it complete only if there is a target set and it's met
        return target > 0 && skillset.kpi_skillset_progress_total_score >= target;
      }).length;
    } else {
      // Fallback to hardcoded value if getCurrentTarget not provided
      return salesProgressData[key].kpi_skillset_progress_max.filter(
        skillset => skillset.kpi_skillset_progress_total_score >= 70
      ).length;
    }
  }
  return 0;
};

export const getTotalSkillsetsCount = (metadata: DashboardMetadata | null): number => {
  // Use metadata for total count
  if (metadata?.mentorDashboard_skillsetKpi_masterData) {
    return metadata.mentorDashboard_skillsetKpi_masterData.length;
  }
  return 0;
};

export const getCompletedRequirementsCount = (
  salesId: number, 
  weekNumber: number, 
  salesProgressData: Record<string, SalesProgressData>,
  getCurrentTarget?: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => number
): number => {
  const key = `${salesId}-${weekNumber}`;
  if (salesProgressData[key] && salesProgressData[key].requirement_progress1) {
    // Count requirements that meet their targets using real target values
    if (getCurrentTarget) {
      // Use actual targets from getCurrentTarget
      return salesProgressData[key].requirement_progress1.filter(req => {
        const reqId = req.requirement_progress_requirement_id - 1; // Subtract 1 because getCurrentTarget adds 1 inside
        const target = getCurrentTarget('requirement', reqId, salesId, weekNumber);
        // Consider it complete only if there is a target set and it's met
        return target > 0 && req.requirement_progress_count >= target;
      }).length;
    } else {
      // Fallback to hardcoded value if getCurrentTarget not provided
      return salesProgressData[key].requirement_progress1.filter(
        req => req.requirement_progress_count >= 1
      ).length;
    }
  }
  return 0;
};

export const getTotalRequirementsCount = (metadata: DashboardMetadata | null): number => {
  // Use metadata for total count
  if (metadata?.mentorDashboard_requirement_masterData) {
    return metadata.mentorDashboard_requirement_masterData.length;
  }
  return 0;
};

export const calculateWeeklyProgressPercentage = (
  salesId: number, 
  weekNumber: number, 
  salesProgressData: Record<string, SalesProgressData>,
  metadata: DashboardMetadata | null,
  getCurrentTarget?: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => number
): number => {
  // If we have metadata but no progress data yet, return 0
  if (!getSalesProgressData(salesId, weekNumber, salesProgressData)) {
    return 0;
  }
  
  // Calculate the overall percentage based on all three categories
  const kpiPercentage = getCompletedKPIsCount(salesId, weekNumber, salesProgressData, getCurrentTarget) / 
    getTotalKPIsCount(salesId, weekNumber, salesProgressData, metadata) || 0;
    
  const skillsetPercentage = getCompletedSkillsetsCount(salesId, weekNumber, salesProgressData, getCurrentTarget) / 
    getTotalSkillsetsCount(metadata) || 0;
    
  const requirementPercentage = getCompletedRequirementsCount(salesId, weekNumber, salesProgressData, getCurrentTarget) / 
    getTotalRequirementsCount(metadata) || 0;
  
  // Calculate average percentage across all categories
  const overallPercentage = ((kpiPercentage + skillsetPercentage + requirementPercentage) / 3) * 100;
  return Math.round(overallPercentage);
}; 