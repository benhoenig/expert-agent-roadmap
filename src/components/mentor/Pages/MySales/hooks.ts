import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { xanoService } from "@/services/xanoService";
import { 
  SalesUser, 
  DashboardMetadata, 
  SalesProgressData, 
  WeeklyPerformance,
  TargetState
} from "./types";

export const useSalesData = () => {
  const [salesData, setSalesData] = useState<SalesUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<Record<number, number>>({});

  const fetchSalesData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await xanoService.getMentorDashboardSales();
      console.log('Mentor dashboard sales data:', data);
      
      if (data && data.result1) {
        setSalesData(data.result1);
        
        // Initialize selected weeks for each sales
        const initialSelectedWeeks: Record<number, number> = {};
        data.result1.forEach(sales => {
          initialSelectedWeeks[sales.id] = 1; // Default to week 1
        });
        setSelectedWeeks(initialSelectedWeeks);
        
        setError(null);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (error) {
      console.error('Error fetching mentor sales data:', error);
      setError('Failed to load sales data. Please try again later.');
      toast.error('Error loading sales data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  return {
    salesData,
    isLoading,
    error,
    selectedWeeks,
    setSelectedWeeks,
    refreshSalesData: fetchSalesData
  };
};

export const useMetadata = () => {
  const [metadata, setMetadata] = useState<DashboardMetadata | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<Record<number, WeeklyPerformance[]>>({});

  const updateWeeklyDataWithMetadata = useCallback((metadata: DashboardMetadata) => {
    setWeeklyData(prevData => {
      const newData = { ...prevData };
      
      // Update each week's data with real KPIs and requirements
      Object.keys(newData).forEach(salesId => {
        newData[Number(salesId)] = newData[Number(salesId)].map(weekData => {
          // Create dummy actions based on real KPI names
          const actions = metadata.mentorDashboard_actionKpi_masterData.map(kpi => ({
            name: kpi.kpi_name,
            done: Math.floor(Math.random() * 10) + 1, // Random numbers for demo
            target: 10
          }));
          
          // Create dummy requirements based on real requirement names
          const requirements = metadata.mentorDashboard_requirement_masterData.map(req => ({
            name: req.requirement_name,
            completed: Math.random() > 0.5 // Random completion status for demo
          }));
          
          // Create skillset scores using all skillset names from metadata
          const skillsetScores = metadata.mentorDashboard_skillsetKpi_masterData.map((_, index) => {
            // Generate random scores for demo
            const wording = Math.floor(Math.random() * 5) + 5; // 5-10 range
            const tonality = Math.floor(Math.random() * 5) + 5;
            const rapport = Math.floor(Math.random() * 5) + 5;
            
            return {
              wording,
              tonality,
              rapport,
              total: (wording + tonality + rapport) / 3
            };
          });
          
          return {
            ...weekData,
            actions,
            requirements,
            skillsetScores
          };
        });
      });
      
      return newData;
    });
  }, []);

  const fetchMetadata = useCallback(async () => {
    try {
      setIsMetadataLoading(true);
      const data = await xanoService.getMentorDashboardMetadata();
      console.log('Mentor dashboard metadata:', data);
      
      if (data) {
        setMetadata(data);
        
        // Initialize weeklyData with mock data structure if empty
        if (Object.keys(weeklyData).length === 0) {
          setWeeklyData({
            1: [
              {
                week: 1,
                actions: [],
                skillsets: [],
                skillsetScores: [],
                requirements: [],
                comment: ""
              },
              {
                week: 2,
                actions: [],
                skillsets: [],
                skillsetScores: [],
                requirements: [],
                comment: ""
              }
            ]
          });
        }
        
        // Update the weekly data with real KPIs and requirements
        updateWeeklyDataWithMetadata(data);
      } else {
        console.error('Invalid metadata format received from API');
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      toast.error('Error loading KPI data');
    } finally {
      setIsMetadataLoading(false);
    }
  }, [updateWeeklyDataWithMetadata, weeklyData]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    metadata,
    isMetadataLoading,
    weeklyData,
    refreshMetadata: fetchMetadata
  };
};

export const useProgressData = (salesData: SalesUser[], selectedWeeks: Record<number, number>) => {
  const [salesProgressData, setSalesProgressData] = useState<Record<string, SalesProgressData>>({});
  const [isProgressLoading, setIsProgressLoading] = useState<Record<string, boolean>>({});

  const fetchSalesProgress = useCallback(async (salesId: number, weekNumber: number, forceRefresh = false) => {
    const key = `${salesId}-${weekNumber}`;
    
    // If we already have this data and don't need to force refresh, don't fetch again
    if (salesProgressData[key] && !forceRefresh) return;
    
    try {
      setIsProgressLoading(prev => ({ ...prev, [key]: true }));
      
      const data = await xanoService.getMentorDashboardSalesProgress(salesId, weekNumber);
      console.log(`Sales progress data for salesId: ${salesId}, week: ${weekNumber}:`, data);
      
      if (data) {
        setSalesProgressData(prev => ({
          ...prev,
          [key]: data
        }));
      } else {
        console.error('Invalid sales progress data format received from API');
      }
    } catch (error) {
      console.error(`Error fetching sales progress for salesId: ${salesId}, week: ${weekNumber}:`, error);
      toast.error('Error loading progress data');
    } finally {
      setIsProgressLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [salesProgressData]);

  // Fetch initial progress data when sales data is loaded
  useEffect(() => {
    if (salesData.length > 0 && Object.keys(selectedWeeks).length > 0) {
      salesData.forEach(sales => {
        const selectedWeek = selectedWeeks[sales.id] || 1;
        fetchSalesProgress(sales.id, selectedWeek);
      });
    }
  }, [salesData, selectedWeeks, fetchSalesProgress]);

  const refreshAllProgressData = useCallback(() => {
    if (salesData.length > 0 && Object.keys(selectedWeeks).length > 0) {
      salesData.forEach(sales => {
        const selectedWeek = selectedWeeks[sales.id] || 1;
        fetchSalesProgress(sales.id, selectedWeek, true);
      });
    }
  }, [salesData, selectedWeeks, fetchSalesProgress]);

  return {
    salesProgressData,
    isProgressLoading,
    fetchSalesProgress,
    refreshAllProgressData
  };
};

export const useComments = () => {
  const [comments, setComments] = useState<Record<string, string>>({});

  const handleCommentChange = useCallback((salesId: number, week: number, comment: string) => {
    const key = `${salesId}-${week}`;
    setComments(prev => ({
      ...prev,
      [key]: comment
    }));
  }, []);

  const getCommentValue = useCallback((salesId: number, week: number, weeklyData: Record<number, WeeklyPerformance[]>) => {
    const key = `${salesId}-${week}`;
    return comments[key] || weeklyData[salesId]?.[week - 1]?.comment || "";
  }, [comments]);

  const saveComment = useCallback((salesId: number, week: number) => {
    // In a real application, this would make an API call to save the comment
    toast.success("Comment saved successfully");
    // For now, just a mock function that shows a success message
  }, []);

  return { comments, handleCommentChange, getCommentValue, saveComment };
};

export const useTargetModal = () => {
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<'action' | 'skillset' | 'requirement'>('action');
  const [selectedTarget, setSelectedTarget] = useState<TargetState | null>(null);
  const [targetSalesId, setTargetSalesId] = useState<number | null>(null);
  const [targetWeek, setTargetWeek] = useState<number | null>(null);

  const handleOpenTargetDialog = useCallback((salesId: number, weekNumber: number) => {
    setTargetSalesId(salesId);
    setTargetWeek(weekNumber);
    setTargetCategory('action');
    setIsTargetModalOpen(true);
  }, []);

  const handleSelectTarget = useCallback((type: 'action' | 'skillset' | 'requirement', id: number, name: string, currentTarget: number = 0) => {
    setSelectedTarget({
      type,
      id,
      name,
      currentTarget,
      newTarget: currentTarget
    });
  }, []);

  const handleTargetValueChange = useCallback((value: string) => {
    if (selectedTarget) {
      setSelectedTarget({
        ...selectedTarget,
        newTarget: parseInt(value) || 0
      });
    }
  }, [selectedTarget]);

  const handleSaveTarget = useCallback(async () => {
    if (!selectedTarget || targetSalesId === null || targetWeek === null) return;

    try {
      // For now, just log the target settings - we'll connect to API later
      console.log('Saving target:', {
        salesId: targetSalesId,
        weekNumber: targetWeek,
        targetType: selectedTarget.type,
        targetId: selectedTarget.id,
        targetName: selectedTarget.name,
        targetValue: selectedTarget.newTarget
      });

      // Show success message
      toast.success(`Target for ${selectedTarget.name} set to ${selectedTarget.newTarget}`);
      
      // Reset selected target
      setSelectedTarget(null);
    } catch (error) {
      console.error('Error saving target:', error);
      toast.error('Failed to save target');
    }
  }, [selectedTarget, targetSalesId, targetWeek]);

  return {
    isTargetModalOpen,
    setIsTargetModalOpen,
    targetCategory,
    setTargetCategory,
    selectedTarget,
    targetSalesId,
    targetWeek,
    handleOpenTargetDialog,
    handleSelectTarget,
    handleTargetValueChange,
    handleSaveTarget
  };
}; 