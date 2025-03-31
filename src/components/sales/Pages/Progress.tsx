import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { MonthlyAccordion, MonthData } from "@/components/ui/monthly-accordion";
import { Accordion } from "@/components/ui/accordion";
import { WeeklyProgressItem, WeeklyProgressData } from "@/components/ui/weekly-progress-item";

export function SalesProgress() {
  const [progressPercentage, setProgressPercentage] = useState(75); // Example progress value
  const [probationPercentage, setProbationPercentage] = useState(60); // Example probation value
  const [currentRank, setCurrentRank] = useState("Level 2"); // Example rank

  // Example weekly data for Month 1 (weeks 1-4)
  const generateMonth1Weeks = (): WeeklyProgressData[] => {
    return Array.from({ length: 4 }, (_, weekIdx) => {
      const basePercentage = 60;
      const weekVariation = weekIdx * 5;
      const progressPercentage = Math.min(Math.max(basePercentage + weekVariation, 0), 100);
      
      return {
        weekNumber: weekIdx + 1,
        isCompleted: progressPercentage >= 100,
        progressPercentage
      };
    });
  };

  // Example weekly data for Month 2 (weeks 5-8)
  const generateMonth2Weeks = (): WeeklyProgressData[] => {
    return Array.from({ length: 4 }, (_, weekIdx) => {
      const basePercentage = 70;
      const weekVariation = weekIdx * 5;
      const progressPercentage = Math.min(Math.max(basePercentage + weekVariation, 0), 100);
      
      return {
        weekNumber: weekIdx + 5, // Starting from week 5
        isCompleted: progressPercentage >= 100,
        progressPercentage
      };
    });
  };

  // Example weekly data for Month 3 (weeks 9-12)
  const generateMonth3Weeks = (): WeeklyProgressData[] => {
    return Array.from({ length: 4 }, (_, weekIdx) => {
      const basePercentage = 80;
      const weekVariation = weekIdx * 5;
      const progressPercentage = Math.min(Math.max(basePercentage + weekVariation, 0), 100);
      
      return {
        weekNumber: weekIdx + 9, // Starting from week 9
        isCompleted: progressPercentage >= 100,
        progressPercentage
      };
    });
  };

  // Example monthly data
  const monthlyData: MonthData[] = [
    {
      month: "Month 1",
      content: (
        <div>
          <h4 className="text-sm font-medium mb-2">Weekly Breakdown</h4>
          <Accordion type="single" collapsible>
            {generateMonth1Weeks().map((week) => (
              <WeeklyProgressItem 
                key={week.weekNumber} 
                week={week} 
              />
            ))}
          </Accordion>
        </div>
      )
    },
    {
      month: "Month 2",
      content: (
        <div>
          <h4 className="text-sm font-medium mb-2">Weekly Breakdown</h4>
          <Accordion type="single" collapsible>
            {generateMonth2Weeks().map((week) => (
              <WeeklyProgressItem 
                key={week.weekNumber} 
                week={week} 
              />
            ))}
          </Accordion>
        </div>
      )
    },
    {
      month: "Month 3",
      content: (
        <div>
          <h4 className="text-sm font-medium mb-2">Weekly Breakdown</h4>
          <Accordion type="single" collapsible>
            {generateMonth3Weeks().map((week) => (
              <WeeklyProgressItem 
                key={week.weekNumber} 
                week={week} 
              />
            ))}
          </Accordion>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Progress Tracking</h2>
          <p className="text-muted-foreground">Monitor your performance metrics</p>
        </div>
      </div>
      
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="mt-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-6">Weekly Progress</h3>
            
            <CircularProgress 
              progressPercentage={progressPercentage}
              probationPercentage={probationPercentage}
              size="md"
              rank={currentRank}
            />
            
            <div className="mt-8">
              <h4 className="text-md font-medium mb-4">Monthly Performance</h4>
              <MonthlyAccordion months={monthlyData} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Performance Statistics</h3>
            <p>Your detailed statistics will appear here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="logs" className="mt-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Activity Logs</h3>
            <p>Your recent activity logs will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
