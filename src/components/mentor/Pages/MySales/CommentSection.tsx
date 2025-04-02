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
  loading: boolean;
}

export function CommentSection({
  salesId,
  selectedWeek,
  getCommentValue,
  handleCommentChange,
  saveComment,
  weeklyData,
  loading
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
          variant="primary-outline"
          size="sm"
          onClick={() => saveComment(salesId, selectedWeek)}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Comment'}
        </Button>
      </div>
    </div>
  );
} 