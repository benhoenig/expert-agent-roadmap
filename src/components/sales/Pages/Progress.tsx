import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [progressData, setProgressData] = useState<Record<number, any>>({});
  const [currentSalesId, setCurrentSalesId] = useState<number | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [isLoadingProgressData, setIsLoadingProgressData] = useState<Record<number, boolean>>({});

  // Using useMemo to create and memoize these arrays to prevent unnecessary rerenders
  const month1Weeks = useMemo(() => [1, 2, 3, 4], []);
  const month2Weeks = useMemo(() => [5, 6, 7, 8], []);
  const month3Weeks = useMemo(() => [9, 10, 11, 12], []);

  // Function to load target data for a specific week
  const loadTargetData = useCallback(async (weekNumber: number) => {
    if (!currentSalesId) return; // Don't load if no sales ID
    
    try {
      console.log(`Fetching target data for sales ID: ${currentSalesId}, week number: ${weekNumber}`);
      
      const response = await xanoService.getSalesInterfaceTarget(currentSalesId, weekNumber);
      console.log(`Received target data for week ${weekNumber}:`, response);
      
      if (Array.isArray(response) && response.length > 0) {
        setTargetData(prev => ({
          ...prev,
          [weekNumber]: response
        }));
      } else {
        console.warn(`No target data received for week ${weekNumber} or invalid format`);
        // Don't clear existing data if no new data received
      }
    } catch (error) {
      console.error(`Error loading target data for week ${weekNumber}:`, error);
      toast.error(`Failed to load targets for week ${weekNumber}`);
      // Don't clear existing data on error
    }
  }, [currentSalesId]);
  
  // Function to load progress data for a specific week
  const loadProgressData = useCallback(async (weekNumber: number) => {
    if (!currentSalesId) return; // Don't load if no sales ID
    
    // Set loading state for this specific week
    setIsLoadingProgressData(prev => ({
      ...prev,
      [weekNumber]: true
    }));
    
    try {
      console.log(`Fetching progress data for sales ID: ${currentSalesId}, week number: ${weekNumber}`);
      
      const response = await xanoService.getSalesInterfaceProgress(currentSalesId, weekNumber);
      console.log(`Received progress data for week ${weekNumber}:`, response);
      
      if (response) {
        setProgressData(prev => ({
          ...prev,
          [weekNumber]: response
        }));
      } else {
        console.warn(`No progress data received for week ${weekNumber} or invalid format`);
      }
    } catch (error) {
      console.error(`Error loading progress data for week ${weekNumber}:`, error);
      toast.error(`Failed to load progress for week ${weekNumber}`);
    } finally {
      // Clear loading state regardless of success or failure
      setIsLoadingProgressData(prev => ({
        ...prev,
        [weekNumber]: false
      }));
    }
  }, [currentSalesId]);

  // Get current user data including sales ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsLoadingUserData(true);
        const salesData = await xanoService.getSalesInterface();
        console.log("Sales interface data:", salesData);
        if (salesData && salesData.id) {
          setCurrentSalesId(salesData.id);
          // Load target data for Week 1 when we get the sales ID
          loadTargetData(1);
          // Also load progress data for Week 1
          loadProgressData(1);
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
        toast.error("Failed to load sales information");
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchCurrentUser();
  }, [loadTargetData, loadProgressData]);

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
        mentorDashboard_skillsetKpi_masterData: response.salesInterface_skillsetKpi_masterData.map((item, index) => {
          // Use actual skillset kpi_ids that match the API (8, 9, 10)
          // Owner Script = 8, Consulting Script = 9, Buyer Script = 10
          return { 
            kpi_id: index + 8, // Starting from 8 to match API's kpi_id for skillsets
            kpi_name: item.kpi_name 
          };
        }),
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
    
    // Also load progress data for this week
    loadProgressData(weekNumber);
  }, [loadTargetData, loadProgressData]);

  // Handle accordion value changes directly
  const handleAccordionChange = (value: string | undefined) => {
    setOpenAccordion(value || null);
  };

  // Function that specifically creates week data for a specific week number
  const createWeekDataForNumber = useCallback((weekNumber: number) => {
    const weekTargets = targetData[weekNumber] || [];
    const weekProgress = progressData[weekNumber];
    
    // Extract the skillset data from the progress data if available
    const skillsetData = weekProgress?.kpi_skillset_progress1 || [];
    
    // Only log on development if needed
    // console.log(`Creating data for week ${weekNumber}, targets available:`, weekTargets.length > 0);
    
    return {
      isLoaded: true,
      isLoading: isLoadingProgressData[weekNumber] || false,
      progressData: weekProgress ? [
        ...(weekProgress.result1 || []).map(kpi => ({ 
          kpi_id: kpi.kpi_action_progress_kpi_id, 
          requirement_id: 0, 
          count: kpi.kpi_action_progress_count,
          is_complete: kpi.kpi_action_progress_count > 0 
        })),
        ...(weekProgress.requirement_progress1 || []).map(req => ({ 
          kpi_id: 0, 
          requirement_id: req.requirement_progress_requirement_id, 
          count: req.requirement_progress_count,
          is_complete: req.requirement_progress_count > 0 
        })),
      ] : [
        // Fallback mock data if no progress data is available
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
      // Only use real targets, no mock data fallback
      targetData: weekTargets,
      // Include the skillset data directly
      skillsetData: skillsetData,
      comment: `Week ${weekNumber} commentary goes here`
    };
  }, [targetData, progressData, isLoadingProgressData]);

  // Calculate progress percentage based on actual achievements against targets
  const calculateProgressPercentage = useCallback((weekNumber: number) => {
    const weekData = createWeekDataForNumber(weekNumber);
    
    if (!weekData || !weekData.progressData) {
      return 0; // No data available
    }
    
    const { progressData, targetData, skillsetData } = weekData;
    
    let totalTargets = 0;
    let achievedTargets = 0;
    
    // Check action KPI targets
    if (targetData && targetData.length > 0) {
      targetData.forEach(target => {
        // Skip if no valid target
        if (!target || !target.target_count || target.target_count <= 0) return;
        
        // Only count targets for KPIs (not requirements or skillsets)
        if (target.kpi_id && target.kpi_id > 0 && target.kpi_id < 8) {
          totalTargets++;
          
          // Find corresponding progress
          const progress = progressData.find(p => p.kpi_id === target.kpi_id);
          
          // If progress meets or exceeds target, count as achieved
          if (progress && progress.count >= target.target_count) {
            achievedTargets++;
          }
        }
      });
    }
    
    // Check skillset targets
    if (targetData && skillsetData && skillsetData.length > 0) {
      // Find skillset targets (kpi_id 8, 9, 10)
      const skillsetTargets = targetData.filter(t => t.kpi_id >= 8 && t.kpi_id <= 10);
      
      skillsetTargets.forEach(target => {
        if (!target || !target.target_count || target.target_count <= 0) return;
        
        totalTargets++;
        
        // Find matching skillset progress by kpi_id
        const skillProgress = skillsetData.find(s => s.kpi_id === target.kpi_id);
        
        // Calculate total score for the skillset (average of wording, tonality, rapport)
        if (skillProgress) {
          const wording = parseInt(skillProgress.wording_score || '0');
          const tonality = parseInt(skillProgress.tonality_score || '0');
          const rapport = parseInt(skillProgress.rapport_score || '0');
          const total = Math.round((wording + tonality + rapport) / 3);
          
          // If total meets or exceeds target, count as achieved
          if (total >= target.target_count) {
            achievedTargets++;
          }
        }
      });
    }
    
    // Check requirement targets
    if (targetData && targetData.length > 0) {
      // Find requirement targets
      const requirementTargets = targetData.filter(t => t.requirement_id > 0);
      
      requirementTargets.forEach(target => {
        if (!target || !target.target_count || target.target_count <= 0) return;
        
        totalTargets++;
        
        // Find corresponding progress
        const progress = progressData.find(p => p.requirement_id === target.requirement_id);
        
        // If progress meets or exceeds target, count as achieved
        if (progress && progress.count >= target.target_count) {
          achievedTargets++;
        }
      });
    }
    
    // Calculate percentage - if no targets, default to 0%
    return totalTargets > 0 ? Math.round((achievedTargets / totalTargets) * 100) : 0;
  }, [createWeekDataForNumber]);

  // Creating a specific week display object
  const createWeekDisplay = useCallback((weekNumber: number) => {
    // Calculate actual progress percentage based on targets and achievements
    const progressPercentage = calculateProgressPercentage(weekNumber);
    
    return {
      weekNumber,
      isCompleted: progressPercentage >= 100,
      progressPercentage,
      weekData: createWeekDataForNumber(weekNumber)
    };
  }, [calculateProgressPercentage, createWeekDataForNumber]);

  // Example monthly data with updated MonthlyAccordion props to handle expansion
  const monthlyData: MonthData[] = useMemo(() => {
    // Remove this log as well
    // console.log("Creating monthly data with targetData:", targetData);
    return [
      {
        month: "Month 1",
        id: "month-0",
        content: (
          <div>
            <div className="space-y-2">
              <Accordion type="single" collapsible value={openAccordion} onValueChange={handleAccordionChange}>
                {month1Weeks.map((weekNumber) => {
                  const weekObj = createWeekDisplay(weekNumber);
                  return (
                    <WeekAccordion
                      key={weekNumber}
                      weekNumber={weekNumber}
                      weekData={weekObj.weekData}
                      isCompleted={weekObj.isCompleted}
                      progressPercentage={weekObj.progressPercentage}
                      metadata={metadata}
                      isMetadataLoaded={isMetadataLoaded}
                      onExpand={handleWeekExpand}
                      className=""
                    />
                  );
                })}
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
                {month2Weeks.map((weekNumber) => {
                  const weekObj = createWeekDisplay(weekNumber);
                  return (
                    <WeekAccordion
                      key={weekNumber}
                      weekNumber={weekNumber}
                      weekData={weekObj.weekData}
                      isCompleted={weekObj.isCompleted}
                      progressPercentage={weekObj.progressPercentage}
                      metadata={metadata}
                      isMetadataLoaded={isMetadataLoaded}
                      onExpand={handleWeekExpand}
                      className=""
                    />
                  );
                })}
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
                {month3Weeks.map((weekNumber) => {
                  const weekObj = createWeekDisplay(weekNumber);
                  return (
                    <WeekAccordion
                      key={weekNumber}
                      weekNumber={weekNumber}
                      weekData={weekObj.weekData}
                      isCompleted={weekObj.isCompleted}
                      progressPercentage={weekObj.progressPercentage}
                      metadata={metadata}
                      isMetadataLoaded={isMetadataLoaded}
                      onExpand={handleWeekExpand}
                      className=""
                    />
                  );
                })}
              </Accordion>
            </div>
          </div>
        )
      }
    ];
  }, [openAccordion, handleAccordionChange, month1Weeks, month2Weeks, month3Weeks, createWeekDisplay, metadata, isMetadataLoaded, handleWeekExpand, targetData]);

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
