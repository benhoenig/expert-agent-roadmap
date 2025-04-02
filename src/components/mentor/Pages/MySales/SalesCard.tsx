import { useEffect, useRef } from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SalesUser, DashboardMetadata, SalesProgressData, WeeklyPerformance } from "./types";
import { getInitials } from "./utils";
import { SalesHeader } from "./SalesHeader";
import { WeekSelector } from "./WeekSelector";
import { WeeklyProgress } from "./WeeklyProgress";
import { KPISection } from "./KPISection";
import { SkillsetSection } from "./SkillsetSection";
import { RequirementsSection } from "./RequirementsSection";
import { CodeOfHonorSection } from "./CodeOfHonorSection";
import { CommentSection } from "./CommentSection";

interface SalesCardProps {
  sales: SalesUser;
  selectedWeek: number;
  handleWeekChange: (salesId: number, week: string) => void;
  handleOpenTargetDialog: (salesId: number, weekNumber: number) => void;
  metadata: DashboardMetadata | null;
  salesProgressData: Record<string, SalesProgressData>;
  isProgressLoading: Record<string, boolean>;
  getCommentValue: (salesId: number, week: number, weeklyData: Record<number, WeeklyPerformance[]>) => string;
  handleCommentChange: (salesId: number, week: number, comment: string) => void;
  saveComment: (salesId: number, week: number) => void;
  weeklyData: Record<number, WeeklyPerformance[]>;
  targetData: any[];
  getCurrentTarget: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => number;
  isExpanded: boolean;
  fetchTargetData: (salesId: number, weekNumber: number, forceRefresh?: boolean) => Promise<void>;
}

export function SalesCard({
  sales,
  selectedWeek,
  handleWeekChange,
  handleOpenTargetDialog,
  metadata,
  salesProgressData,
  isProgressLoading,
  getCommentValue,
  handleCommentChange,
  saveComment,
  weeklyData,
  targetData,
  getCurrentTarget,
  isExpanded,
  fetchTargetData
}: SalesCardProps) {
  const salesUser = sales._user[0];
  
  // Track previous expanded state to avoid duplicate fetches
  const prevExpandedRef = useRef(false);
  
  // Fetch target data when the accordion is expanded
  useEffect(() => {
    // Only fetch data if:
    // 1. The accordion is newly expanded (wasn't expanded before)
    // 2. The week has changed while expanded
    const isNewlyExpanded = isExpanded && !prevExpandedRef.current;
    
    if (isExpanded) {
      // Use setTimeout to debounce the API call and prevent rapid consecutive calls
      const timerId = setTimeout(() => {
        console.log(`SalesCard expanded for salesId=${sales.id}, weekNumber=${selectedWeek}, fetching target data`);
        fetchTargetData(sales.id, selectedWeek);
      }, 300);
      
      // Save current expanded state for next render
      prevExpandedRef.current = isExpanded;
      
      // Clean up timeout if component unmounts or dependencies change
      return () => clearTimeout(timerId);
    } else {
      // Update ref when accordion is collapsed
      prevExpandedRef.current = false;
    }
  }, [isExpanded, sales.id, selectedWeek, fetchTargetData]);
  
  return (
    <AccordionItem 
      key={sales.id} 
      value={`sales-${sales.id}`}
      className="border rounded-lg overflow-hidden shadow-sm"
    >
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={salesUser?.profile_image || ""} />
              <AvatarFallback className="bg-gold-100 text-gold-800">
                {getInitials(salesUser?.full_name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h3 className="font-medium">{salesUser?.full_name || "Unnamed User"}</h3>
              <p className="text-sm text-muted-foreground">Generation {sales.generation}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gold-100 text-gold-800">
              {sales._rank?.rank_name || `Rank #${sales.current_rank}`}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-6 py-4 bg-card">
        {/* Only render the expensive components when the accordion is expanded */}
        {isExpanded && (
          <>
            {/* Basic Info */}
            <SalesHeader sales={sales} />

            {/* Week Selection */}
            <WeekSelector 
              salesId={sales.id}
              selectedWeek={selectedWeek}
              handleWeekChange={handleWeekChange}
              handleOpenTargetDialog={handleOpenTargetDialog}
            />

            {/* Weekly Progress Summary */}
            <WeeklyProgress 
              salesId={sales.id}
              selectedWeek={selectedWeek}
              salesProgressData={salesProgressData}
              metadata={metadata}
              getCurrentTarget={getCurrentTarget}
            />

            {/* KPI and Actions */}
            <KPISection 
              salesId={sales.id}
              selectedWeek={selectedWeek}
              metadata={metadata}
              salesProgressData={salesProgressData}
              isProgressLoading={isProgressLoading}
              getCurrentTarget={getCurrentTarget}
            />

            {/* Skillsets */}
            <SkillsetSection 
              salesId={sales.id}
              selectedWeek={selectedWeek}
              metadata={metadata}
              salesProgressData={salesProgressData}
              isProgressLoading={isProgressLoading}
              getCurrentTarget={getCurrentTarget}
            />

            {/* Requirements */}
            <RequirementsSection 
              salesId={sales.id}
              selectedWeek={selectedWeek}
              metadata={metadata}
              salesProgressData={salesProgressData}
              isProgressLoading={isProgressLoading}
              getCurrentTarget={getCurrentTarget}
            />

            {/* Code of Honor */}
            <CodeOfHonorSection />

            {/* Mentor Comment */}
            <CommentSection 
              salesId={sales.id}
              selectedWeek={selectedWeek}
              getCommentValue={getCommentValue}
              handleCommentChange={handleCommentChange}
              saveComment={saveComment}
              weeklyData={weeklyData}
              loading={false}
            />
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
} 