import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WeeklyPerformance } from "./types";

interface CommentSectionProps {
  salesId: number;
  selectedWeek: number;
  getCommentValue: (salesId: number, week: number, weeklyData: Record<number, WeeklyPerformance[]>) => string;
  handleCommentChange: (salesId: number, week: number, comment: string) => void;
  saveComment: (salesId: number, week: number) => void;
  weeklyData: Record<number, WeeklyPerformance[]>;
}

export function CommentSection({
  salesId,
  selectedWeek,
  getCommentValue,
  handleCommentChange,
  saveComment,
  weeklyData
}: CommentSectionProps) {
  return (
    <div>
      <h4 className="text-md font-medium mb-3">Mentor Comment</h4>
      <Textarea 
        placeholder="Add your comments about this week's performance"
        className="min-h-[100px]"
        value={getCommentValue(salesId, selectedWeek, weeklyData)}
        onChange={(e) => handleCommentChange(salesId, selectedWeek, e.target.value)}
      />
      <div className="flex justify-end mt-2">
        <Button 
          variant="outline" 
          className="border-gold-500 text-gold-500 hover:bg-gold-50"
          onClick={() => saveComment(salesId, selectedWeek)}
        >
          Save Comment
        </Button>
      </div>
    </div>
  );
} 