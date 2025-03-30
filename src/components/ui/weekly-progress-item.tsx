import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WeeklyProgressData {
  weekNumber: number;
  isCompleted: boolean;
  progressPercentage: number;
}

interface WeeklyProgressItemProps {
  week: WeeklyProgressData;
  content?: React.ReactNode;
  className?: string;
}

export function WeeklyProgressItem({ week, content, className }: WeeklyProgressItemProps) {
  return (
    <AccordionItem value={`week-${week.weekNumber}`} className={cn("border-0", className)}>
      <AccordionTrigger className="py-3 px-2 rounded-md hover:bg-muted hover:no-underline">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0 w-24">
            <span className="text-sm font-medium">Week {week.weekNumber}</span>
          </div>
          
          <div className="flex-shrink-0 ml-2">
            {week.isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <div className="h-5 w-5" />
            )}
          </div>
          
          <div className="flex-grow mx-4">
            <Progress value={week.progressPercentage} className="h-2" />
          </div>
          
          <div className="flex-shrink-0 w-14 text-right mr-2">
            <span className="text-sm">{week.progressPercentage}%</span>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="pl-24 pt-2 pb-3">
        {content || (
          <div className="text-sm text-muted-foreground">
            Detailed information for Week {week.weekNumber}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
} 