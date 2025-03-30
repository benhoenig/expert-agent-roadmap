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
  weeklyData
}: SalesCardProps) {
  const salesUser = sales._user[0];
  
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
        />

        {/* KPI and Actions */}
        <KPISection 
          salesId={sales.id}
          selectedWeek={selectedWeek}
          metadata={metadata}
          salesProgressData={salesProgressData}
          isProgressLoading={isProgressLoading}
        />

        {/* Skillsets */}
        <SkillsetSection 
          salesId={sales.id}
          selectedWeek={selectedWeek}
          metadata={metadata}
          salesProgressData={salesProgressData}
          isProgressLoading={isProgressLoading}
        />

        {/* Requirements */}
        <RequirementsSection 
          salesId={sales.id}
          selectedWeek={selectedWeek}
          metadata={metadata}
          salesProgressData={salesProgressData}
          isProgressLoading={isProgressLoading}
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
        />
      </AccordionContent>
    </AccordionItem>
  );
} 