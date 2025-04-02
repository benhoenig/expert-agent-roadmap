import { DashboardMetadata, SalesProgressData } from "./types";
import { 
  getCompletedKPIsCount, 
  getTotalKPIsCount, 
  getCompletedSkillsetsCount, 
  getTotalSkillsetsCount, 
  getCompletedRequirementsCount, 
  getTotalRequirementsCount,
  calculateWeeklyProgressPercentage
} from "./utils";

interface WeeklyProgressProps {
  salesId: number;
  selectedWeek: number;
  salesProgressData: Record<string, SalesProgressData>;
  metadata: DashboardMetadata | null;
  getCurrentTarget: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => number;
}

export function WeeklyProgress({ 
  salesId, 
  selectedWeek, 
  salesProgressData, 
  metadata,
  getCurrentTarget
}: WeeklyProgressProps) {
  const progressPercentage = calculateWeeklyProgressPercentage(salesId, selectedWeek, salesProgressData, metadata, getCurrentTarget);
  const isGoodProgress = progressPercentage >= 70;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-md font-medium">Weekly Progress</h4>
        <span className="text-sm font-medium text-muted-foreground">
          {progressPercentage}%
        </span>
      </div>
      <div className="h-2 w-full bg-secondary rounded-full">
        <div 
          className={`h-full rounded-full ${isGoodProgress ? 'bg-green-500' : 'bg-gold-500'}`}
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>KPIs: {getCompletedKPIsCount(salesId, selectedWeek, salesProgressData, getCurrentTarget)}/{getTotalKPIsCount(salesId, selectedWeek, salesProgressData, metadata)}</span>
        <span>Skillsets: {getCompletedSkillsetsCount(salesId, selectedWeek, salesProgressData, getCurrentTarget)}/{getTotalSkillsetsCount(metadata)}</span>
        <span>Requirements: {getCompletedRequirementsCount(salesId, selectedWeek, salesProgressData, getCurrentTarget)}/{getTotalRequirementsCount(metadata)}</span>
      </div>
    </div>
  );
} 