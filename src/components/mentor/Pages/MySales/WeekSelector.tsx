import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Target } from "lucide-react";

interface WeekSelectorProps {
  salesId: number;
  selectedWeek: number;
  handleWeekChange: (salesId: number, week: string) => void;
  handleOpenTargetDialog: (salesId: number, weekNumber: number) => void;
}

export function WeekSelector({
  salesId,
  selectedWeek,
  handleWeekChange,
  handleOpenTargetDialog
}: WeekSelectorProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Week {selectedWeek} Performance</h3>
          <div className="w-32">
            <Select
              value={selectedWeek.toString()}
              onValueChange={(value) => handleWeekChange(salesId, value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select week" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                  <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Set Target Button */}
        <Button 
          variant="outline" 
          size="sm"
          className="border-gold-500 text-gold-500 hover:bg-gold-50"
          onClick={() => handleOpenTargetDialog(salesId, selectedWeek)}
        >
          <Target className="mr-1 h-3 w-3" />
          Set Target
        </Button>
      </div>
      <Separator className="my-4" />
    </div>
  );
} 