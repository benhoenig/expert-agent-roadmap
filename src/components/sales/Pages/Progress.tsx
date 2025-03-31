import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect, useCallback } from "react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { MonthlyAccordion, MonthData } from "@/components/ui/monthly-accordion";
import { Accordion } from "@/components/ui/accordion";
import { WeekAccordion } from "./WeekAccordion";
import { xanoService } from "@/services/xanoService";
import { toast } from "sonner";

// Generate mock week data for demo purposes
const generateWeekData = (weekNumber: number) => {
  return {
    isLoaded: true,
    isLoading: false,
    progressData: [
      { kpi_id: 1, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
      { kpi_id: 2, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
      { kpi_id: 3, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
      { kpi_id: 101, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
      { kpi_id: 102, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
      { kpi_id: 103, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
    ],
    targetData: [
      { kpi_id: 1, requirement_id: 0, target_count: 8 },
      { kpi_id: 2, requirement_id: 0, target_count: 5 },
      { kpi_id: 3, requirement_id: 0, target_count: 10 },
      { kpi_id: 101, requirement_id: 0, target_count: 7 },
      { kpi_id: 102, requirement_id: 0, target_count: 6 },
      { kpi_id: 103, requirement_id: 0, target_count: 9 },
    ],
    comment: `Week ${weekNumber} commentary goes here`
  };
};

export function SalesProgress() {
  const [progressPercentage, setProgressPercentage] = useState(75); // Example progress value
  const [probationPercentage, setProbationPercentage] = useState(60); // Example probation value
  const [currentRank, setCurrentRank] = useState("Level 2"); // Example rank
  const [metadata, setMetadata] = useState(null);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [targetData, setTargetData] = useState<Record<number, any[]>>({});
  const [currentSalesId, setCurrentSalesId] = useState<number | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // Get current user data including sales ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoadingUserData(true);
        const userData = await xanoService.getUserData();
        // Assuming the user data contains the sales ID
        if (userData && userData.id) {
          setCurrentSalesId(userData.id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user information");
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Load metadata only when needed (when a month accordion is expanded)
  const loadMetadata = useCallback(async () => {
    if (metadata || isLoadingMetadata) return; // Don't load if already loaded or loading
    
    try {
      setIsLoadingMetadata(true);
      const response = await xanoService.getSalesInterfaceMetadata();
      
      // Map the response structure to match the format expected by WeekAccordion
      const mappedMetadata = {
        mentorDashboard_actionKpi_masterData: response.result1.map((item, index) => ({ 
          kpi_id: index + 1, 
          kpi_name: item.kpi_name 
        })),
        mentorDashboard_skillsetKpi_masterData: response.salesInterface_skillsetKpi_masterData.map((item, index) => ({ 
          kpi_id: index + 101, // Use a different number range to avoid conflicts
          kpi_name: item.kpi_name 
        })),
        mentorDashboard_requirement_masterData: response.salesInterface_requirement_masterData.map((item, index) => ({ 
          requirement_id: index + 1, 
          requirement_name: item.requirement_name 
        }))
      };
      
      setMetadata(mappedMetadata);
      setIsMetadataLoaded(true);
    } catch (error) {
      console.error("Error loading metadata:", error);
      toast.error("Failed to load metadata. Please try again.");
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [metadata, isLoadingMetadata]);

  // Function to load target data for a specific week
  const loadTargetData = useCallback(async (weekNumber: number) => {
    if (!currentSalesId || targetData[weekNumber]) return; // Don't load if no sales ID or already loaded
    
    try {
      const response = await xanoService.getSalesInterfaceTarget(currentSalesId, weekNumber);
      setTargetData(prev => ({
        ...prev,
        [weekNumber]: response
      }));
    } catch (error) {
      console.error(`Error loading target data for week ${weekNumber}:`, error);
      toast.error(`Failed to load targets for week ${weekNumber}`);
    }
  }, [currentSalesId, targetData]);

  // Function to handle month accordion expansion
  const handleMonthExpand = useCallback((value: string) => {
    if (!expandedMonth && value) {
      // Loading metadata only on first expansion of any month
      loadMetadata();
    }
    setExpandedMonth(value);
  }, [expandedMonth, loadMetadata]);

  // Handle accordion expansion
  const handleWeekExpand = useCallback((weekNumber: number) => {
    console.log(`Week ${weekNumber} expanded`);
    setOpenAccordion(`week-${weekNumber}`);
    
    // Load target data for this week if not already loaded
    loadTargetData(weekNumber);
  }, [loadTargetData]);

  // Handle accordion value changes directly
  const handleAccordionChange = (value: string | undefined) => {
    setOpenAccordion(value || null);
  };

  // Generate week data with real targets if available
  const generateWeekData = useCallback((weekNumber: number) => {
    const weekTargets = targetData[weekNumber] || [];
    
    return {
      isLoaded: true,
      isLoading: false,
      progressData: [
        { kpi_id: 1, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
        { kpi_id: 2, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
        { kpi_id: 3, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
        { kpi_id: 4, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
        { kpi_id: 5, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
        { kpi_id: 6, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
        { kpi_id: 8, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
        { kpi_id: 9, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
        { kpi_id: 10, requirement_id: 0, count: Math.floor(Math.random() * 10), is_complete: Math.random() > 0.5 },
        { kpi_id: 0, requirement_id: 1, count: Math.random() > 0.5 ? 1 : 0, is_complete: Math.random() > 0.5 },
        { kpi_id: 0, requirement_id: 3, count: Math.random() > 0.5 ? 1 : 0, is_complete: Math.random() > 0.5 },
      ],
      // Use real targets if available, otherwise use mock data
      targetData: weekTargets.length > 0 ? weekTargets : [
        { kpi_id: 1, requirement_id: 0, target_count: 20 },
        { kpi_id: 2, requirement_id: 0, target_count: 20 },
        { kpi_id: 3, requirement_id: 0, target_count: 50 },
        { kpi_id: 4, requirement_id: 0, target_count: 50 },
        { kpi_id: 5, requirement_id: 0, target_count: 50 },
        { kpi_id: 6, requirement_id: 0, target_count: 50 },
        { kpi_id: 8, requirement_id: 0, target_count: 95 },
        { kpi_id: 9, requirement_id: 0, target_count: 95 },
        { kpi_id: 10, requirement_id: 0, target_count: 70 },
        { kpi_id: 0, requirement_id: 1, target_count: 1 },
        { kpi_id: 0, requirement_id: 3, target_count: 1 },
      ],
      comment: `Week ${weekNumber} commentary goes here`
    };
  }, [targetData]);

  // Example weekly data for Month 1 (weeks 1-4)
  const generateMonth1Weeks = useCallback(() => {
    return Array.from({ length: 4 }, (_, weekIdx) => {
      const weekNumber = weekIdx + 1;
      const basePercentage = 60;
      const weekVariation = weekIdx * 5;
      const progressPercentage = Math.min(Math.max(basePercentage + weekVariation, 0), 100);
      
      return {
        weekNumber,
        isCompleted: progressPercentage >= 100,
        progressPercentage,
        weekData: generateWeekData(weekNumber)
      };
    });
  }, [generateWeekData]);

  // Example weekly data for Month 2 (weeks 5-8)
  const generateMonth2Weeks = useCallback(() => {
    return Array.from({ length: 4 }, (_, weekIdx) => {
      const weekNumber = weekIdx + 5; // Starting from week 5
      const basePercentage = 70;
      const weekVariation = weekIdx * 5;
      const progressPercentage = Math.min(Math.max(basePercentage + weekVariation, 0), 100);
      
      return {
        weekNumber,
        isCompleted: progressPercentage >= 100,
        progressPercentage,
        weekData: generateWeekData(weekNumber)
      };
    });
  }, [generateWeekData]);

  // Example weekly data for Month 3 (weeks 9-12)
  const generateMonth3Weeks = useCallback(() => {
    return Array.from({ length: 4 }, (_, weekIdx) => {
      const weekNumber = weekIdx + 9; // Starting from week 9
      const basePercentage = 80;
      const weekVariation = weekIdx * 5;
      const progressPercentage = Math.min(Math.max(basePercentage + weekVariation, 0), 100);
      
      return {
        weekNumber,
        isCompleted: progressPercentage >= 100,
        progressPercentage,
        weekData: generateWeekData(weekNumber)
      };
    });
  }, [generateWeekData]);

  // Example monthly data with updated MonthlyAccordion props to handle expansion
  const monthlyData: MonthData[] = [
    {
      month: "Month 1",
      id: "month-0",
      content: (
        <div>
          <div className="space-y-2">
            <Accordion type="single" collapsible value={openAccordion} onValueChange={handleAccordionChange}>
              {generateMonth1Weeks().map((week) => (
                <WeekAccordion
                  key={week.weekNumber}
                  weekNumber={week.weekNumber}
                  weekData={week.weekData}
                  isCompleted={week.isCompleted}
                  progressPercentage={week.progressPercentage}
                  metadata={metadata}
                  isMetadataLoaded={isMetadataLoaded}
                  onExpand={handleWeekExpand}
                  className=""
                />
              ))}
            </Accordion>
          </div>
        </div>
      )
    },
    {
      month: "Month 2",
      id: "month-1",
      content: (
        <div>
          <div className="space-y-2">
            <Accordion type="single" collapsible value={openAccordion} onValueChange={handleAccordionChange}>
              {generateMonth2Weeks().map((week) => (
                <WeekAccordion
                  key={week.weekNumber}
                  weekNumber={week.weekNumber}
                  weekData={week.weekData}
                  isCompleted={week.isCompleted}
                  progressPercentage={week.progressPercentage}
                  metadata={metadata}
                  isMetadataLoaded={isMetadataLoaded}
                  onExpand={handleWeekExpand}
                  className=""
                />
              ))}
            </Accordion>
          </div>
        </div>
      )
    },
    {
      month: "Month 3",
      id: "month-2",
      content: (
        <div>
          <div className="space-y-2">
            <Accordion type="single" collapsible value={openAccordion} onValueChange={handleAccordionChange}>
              {generateMonth3Weeks().map((week) => (
                <WeekAccordion
                  key={week.weekNumber}
                  weekNumber={week.weekNumber}
                  weekData={week.weekData}
                  isCompleted={week.isCompleted}
                  progressPercentage={week.progressPercentage}
                  metadata={metadata}
                  isMetadataLoaded={isMetadataLoaded}
                  onExpand={handleWeekExpand}
                  className=""
                />
              ))}
            </Accordion>
          </div>
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
          {/* Circular Progress card */}
          <div className="rounded-lg border p-6 mb-6">
            <h3 className="text-lg font-medium mb-6">Overall Progress</h3>
            
            <div className="flex justify-center">
              <CircularProgress 
                progressPercentage={progressPercentage}
                probationPercentage={probationPercentage}
                size="md"
                rank={currentRank}
              />
            </div>
          </div>
          
          {/* Weekly breakdown with lazy-loaded metadata */}
          <div className="rounded-lg border">
            <h3 className="text-lg font-medium p-4 pb-2">Weekly Breakdown</h3>
            <div className="px-1 pb-2">
              <MonthlyAccordion 
                months={monthlyData} 
                onValueChange={handleMonthExpand}
                value={expandedMonth}
              />
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
            <p>Your activity history will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
