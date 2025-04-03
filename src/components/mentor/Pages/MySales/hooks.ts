import { useState, useEffect, useCallback, useRef } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<Record<number, number>>({});
  const isMountedRef = useRef(true);
  const initialFetchRef = useRef(false);

  const fetchSalesData = useCallback(async (forceRefresh = false) => {
    // Skip if already loading and not forcing a refresh
    if (isLoading && !forceRefresh) return;
    
    try {
      setIsLoading(true);
      const data = await xanoService.getMentorDashboardSales();
      
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
      console.log('Mentor dashboard sales data:', data);
      
      if (data && data.result1) {
        setSalesData(data.result1);
        
        // Initialize selected weeks for each sales if they don't already exist
        setSelectedWeeks(prev => {
          const initialSelectedWeeks = { ...prev };
          data.result1.forEach(sales => {
            if (!initialSelectedWeeks[sales.id]) {
              initialSelectedWeeks[sales.id] = 1; // Default to week 1
            }
          });
          return initialSelectedWeeks;
        });
        
        setError(null);
      } else {
        throw new Error('Invalid data format received from API');
      }
    } catch (error) {
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
      console.error('Error fetching mentor sales data:', error);
      setError('Failed to load sales data. Please try again later.');
      
      // Don't show toast for rate limit errors
      if (error?.response?.status !== 429) {
        toast.error('Error loading sales data');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isLoading]);
  
  // Setup unmount cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    if (!initialFetchRef.current && isMountedRef.current) {
      initialFetchRef.current = true;
      fetchSalesData();
    }
  }, [fetchSalesData]);

  return {
    salesData,
    isLoading,
    error,
    selectedWeeks,
    setSelectedWeeks,
    refreshSalesData: useCallback(() => fetchSalesData(true), [fetchSalesData])
  };
};

export const useMetadata = () => {
  const [metadata, setMetadata] = useState<DashboardMetadata | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<Record<number, WeeklyPerformance[]>>({});
  const isMountedRef = useRef(true);
  const initialFetchRef = useRef(false);

  const updateWeeklyDataWithMetadata = useCallback((metadata: DashboardMetadata) => {
    if (!isMountedRef.current) return;
    
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

  const fetchMetadata = useCallback(async (forceRefresh = false) => {
    // Skip if already loading or not forcing
    if (isMetadataLoading && !forceRefresh) {
      return;
    }
    
    try {
      setIsMetadataLoading(true);
      
      const data = await xanoService.getMentorDashboardMetadata();
      
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;
      
      console.log('Mentor dashboard metadata:', data);
      
      if (data) {
        setMetadata(data);
        
        // Initialize weeklyData with mock data structure if not already initialized
        setWeeklyData(prevData => {
          // If we already have data, don't reinitialize
          if (Object.keys(prevData).length > 0) {
            return prevData;
          }
          
          // Otherwise initialize with empty structure
          return {
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
          };
        });
        
        // Update the weekly data with real KPIs and requirements
        updateWeeklyDataWithMetadata(data);
      } else {
        console.error('Invalid metadata format received from API');
      }
    } catch (error) {
      // Check if component is still mounted before updating state
      if (!isMountedRef.current) return;
      
      console.error('Error fetching metadata:', error);
      
      // Don't show toast for rate limit errors to avoid spamming the user
      if (error?.response?.status !== 429) {
        toast.error('Error loading KPI data');
      }
    } finally {
      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        setIsMetadataLoading(false);
      }
    }
  }, [isMetadataLoading, updateWeeklyDataWithMetadata]);

  // Setup cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initial fetch on mount only
  useEffect(() => {
    if (!initialFetchRef.current && isMountedRef.current) {
      initialFetchRef.current = true;
      // Delay the metadata fetch to avoid collision with sales data fetch
      setTimeout(() => {
        if (isMountedRef.current) {
          fetchMetadata();
        }
      }, 500);
    }
  }, [fetchMetadata]);

  const refreshMetadata = useCallback(() => {
    // Force refresh by explicitly calling fetchMetadata with force=true
    return fetchMetadata(true);
  }, [fetchMetadata]);

  return {
    metadata,
    isMetadataLoading,
    weeklyData,
    refreshMetadata
  };
};

export const useProgressData = (salesData: SalesUser[], selectedWeeks: Record<number, number>) => {
  const [salesProgressData, setSalesProgressData] = useState<Record<string, SalesProgressData>>({});
  const [isProgressLoading, setIsProgressLoading] = useState<Record<string, boolean>>({});
  const isMountedRef = useRef(true);
  const activeRequestsRef = useRef<Record<string, boolean>>({});

  // Setup unmount cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchSalesProgress = useCallback(async (salesId: number, weekNumber: number, forceRefresh = false) => {
    const key = `${salesId}-${weekNumber}`;
    
    // Skip if we already have this data and don't need to force refresh
    // Also skip if the same request is already in progress
    if ((salesProgressData[key] && !forceRefresh) || isProgressLoading[key] || activeRequestsRef.current[key]) {
      return;
    }
    
    try {
      // Mark this request as in progress
      activeRequestsRef.current[key] = true;
      
      if (isMountedRef.current) {
        setIsProgressLoading(prev => ({ ...prev, [key]: true }));
      }
      
      const data = await xanoService.getMentorDashboardSalesProgress(salesId, weekNumber);
      
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
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
      // Check if component is still mounted
      if (!isMountedRef.current) return;
      
      console.error(`Error fetching sales progress data for salesId: ${salesId}, week: ${weekNumber}:`, error);
      
      // Don't show toast for rate limit errors
      if (error?.response?.status !== 429) {
        toast.error('Error loading sales progress data');
      }
    } finally {
      // Remove from active requests
      delete activeRequestsRef.current[key];
      
      if (isMountedRef.current) {
        setIsProgressLoading(prev => ({ ...prev, [key]: false }));
      }
    }
  }, [salesProgressData, isProgressLoading]);

  const refreshAllProgressData = useCallback(() => {
    // Only refresh data for items we've already loaded
    Object.keys(salesProgressData).forEach(key => {
      const [salesId, weekNumber] = key.split('-').map(Number);
      fetchSalesProgress(salesId, weekNumber, true);
    });
  }, [fetchSalesProgress, salesProgressData]);

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
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [targetData, setTargetData] = useState<any[]>([]);
  const isMountedRef = useRef(true);
  const targetDataCache = useRef<Record<string, any[]>>({});

  // Track in-progress API requests to prevent duplicates
  const pendingRequestsRef = useRef<Record<string, boolean>>({});

  // Setup unmount cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clear any pending requests to avoid state updates after unmount
      pendingRequestsRef.current = {};
      console.log("Target modal hook unmounting");
    };
  }, []);

  const fetchTargetData = useCallback(async (salesId: number, weekNumber: number, forceRefresh = false) => {
    const cacheKey = `${salesId}-${weekNumber}`;
    
    // Skip if already fetching this data
    if (pendingRequestsRef.current[cacheKey]) {
      console.log(`Already fetching target data for salesId=${salesId}, weekNumber=${weekNumber}`);
      return;
    }
    
    console.log(`Fetching target data for salesId=${salesId}, weekNumber=${weekNumber}`);
    
    // If we already have cached data and don't need to refresh, use that
    if (targetDataCache.current[cacheKey] && !forceRefresh) {
      console.log('Using cached target data');
      setTargetData(targetDataCache.current[cacheKey]);
      return;
    }
    
    try {
      // Mark this request as in progress
      pendingRequestsRef.current[cacheKey] = true;
      setIsLoadingTargets(true);
      
      // Use the xanoService method to fetch target data
      const data = await xanoService.getMentorDashboardSalesTarget(salesId, weekNumber);
      
      if (!isMountedRef.current) return;
      
      console.log('Target data received:', data);
      
      // Update state and cache
      setTargetData(data || []);
      targetDataCache.current[cacheKey] = data || [];
      
    } catch (error) {
      console.error('Error fetching target data:', error);
      if (isMountedRef.current) {
        setTargetData([]);
      }
    } finally {
      // Clear the in-progress flag
      delete pendingRequestsRef.current[cacheKey];
      
      if (isMountedRef.current) {
        setIsLoadingTargets(false);
      }
    }
  }, []);

  const handleOpenTargetDialog = useCallback((salesId: number, weekNumber: number) => {
    console.log(`Opening target dialog for salesId=${salesId}, weekNumber=${weekNumber}`);
    
    // Set state values
    setTargetSalesId(salesId);
    setTargetWeek(weekNumber);
    setTargetCategory('action');
    setIsTargetModalOpen(true);
    
    // Fetch the target data
    fetchTargetData(salesId, weekNumber);
  }, [fetchTargetData]);

  const getCurrentTarget = useCallback((type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, weekNumber?: number) => {
    if (!salesId || !weekNumber) return 0;
    
    // Use both the cached data and the state data
    const cacheKey = `${salesId}-${weekNumber}`;
    const weekSpecificTargetData = targetDataCache.current[cacheKey] || targetData[cacheKey] || [];
    
    // Find the target in the week-specific data
    const targetItem = weekSpecificTargetData.find(item => {
      if (type === 'action') {
        // For actions, use id+1 to match the actual IDs in the database
        // From the images, we can see that New List is 1, Owner Visit is 2, Consult 2% is 3, etc.
        return item.kpi_id === (id+1) && (!item.requirement_id || item.requirement_id === 0);
      } else if (type === 'requirement') {
        // For requirements, use id+1 to match actual requirement IDs
        return item.requirement_id === (id+1);
      } else if (type === 'skillset') {
        // Skillset KPIs might have a different ID range
        // Assuming they start at ID 8 based on your code
        return item.kpi_id === id + 8 && (!item.requirement_id || item.requirement_id === 0);
      }
      return false;
    });
    
    return targetItem ? targetItem.target_count : 0;
  }, [targetDataCache, targetData]);

  const handleSelectTarget = useCallback((type: 'action' | 'skillset' | 'requirement', id: number, name: string) => {
    console.log(`Selecting target: type=${type}, id=${id}, name=${name}`);
    
    // Get the current target value for this item
    const currentTarget = getCurrentTarget(type, id, targetSalesId as number, targetWeek as number);
    
    setSelectedTarget({
      type,
      id,
      name,
      currentTarget,
      newTarget: currentTarget
    });
  }, [getCurrentTarget, targetSalesId, targetWeek]);

  const handleTargetValueChange = useCallback((value: string) => {
    if (!selectedTarget) return;
    
    console.log(`Target value changed to: ${value}`);
    setSelectedTarget({
      ...selectedTarget,
      newTarget: parseInt(value) || 0
    });
  }, [selectedTarget]);

  const handleSaveTarget = useCallback(async () => {
    console.log("Saving target...");
    
    if (!selectedTarget || targetSalesId === null || targetWeek === null) {
      console.log("Cannot save target - missing data", { selectedTarget, targetSalesId, targetWeek });
      return;
    }

    try {
      // Get the current mentor ID first
      const mentorId = await xanoService.getCurrentMentorId();
      console.log("Current mentor ID for target update:", mentorId);
      
      // Prepare the update data for the API with all required parameters
      const updateData: any = {
        mentor_id: mentorId,
        sales_id: targetSalesId,
        week_number: targetWeek,
        target_count: selectedTarget.newTarget
      };
      
      // Set the appropriate ID based on the target type
      if (selectedTarget.type === 'action') {
        // Add 1 to match the actual IDs in the database
        updateData.kpi_id = selectedTarget.id + 1;
        updateData.requirement_id = 0;
      } else if (selectedTarget.type === 'requirement') {
        // Add 1 to match the actual IDs in the database
        updateData.requirement_id = selectedTarget.id + 1;
        updateData.kpi_id = 0;
      } else if (selectedTarget.type === 'skillset') {
        // For skillsets, add 8 to the id based on the API design
        updateData.kpi_id = selectedTarget.id + 8;
        updateData.requirement_id = 0;
      }
      
      console.log("Calling API to update target with data:", updateData);
      
      // Call the API to update the target
      await xanoService.updateMentorDashboardSalesTarget(updateData);
      
      // Show success message
      toast.success(`Target for ${selectedTarget.name} set to ${selectedTarget.newTarget}`);
      
      // Update local cache to reflect the new target
      const cacheKey = `${targetSalesId}-${targetWeek}`;
      
      // Find the target in the current cache or create a new array if needed
      const currentTargets = [...(targetDataCache.current[cacheKey] || [])];
      
      // Find the index of the existing target if it exists
      const existingTargetIndex = currentTargets.findIndex(target => {
        if (selectedTarget.type === 'action') {
          return target.kpi_id === selectedTarget.id + 1 && (!target.requirement_id || target.requirement_id === 0);
        } else if (selectedTarget.type === 'requirement') {
          return target.requirement_id === selectedTarget.id + 1;
        } else if (selectedTarget.type === 'skillset') {
          return target.kpi_id === selectedTarget.id + 8 && (!target.requirement_id || target.requirement_id === 0);
        }
        return false;
      });
      
      // Update or add the target in the cache
      if (existingTargetIndex >= 0) {
        // Update existing target
        currentTargets[existingTargetIndex] = {
          ...currentTargets[existingTargetIndex],
          target_count: selectedTarget.newTarget
        };
      } else {
        // Add new target
        currentTargets.push({
          kpi_id: selectedTarget.type === 'action' ? selectedTarget.id + 1 : 
                  selectedTarget.type === 'skillset' ? selectedTarget.id + 8 : 0,
          requirement_id: selectedTarget.type === 'requirement' ? selectedTarget.id + 1 : 0,
          target_count: selectedTarget.newTarget
        });
      }
      
      // Update the cache
      targetDataCache.current[cacheKey] = currentTargets;
      
      // Update the component state
      setTargetData(currentTargets);
      
      // Update the current target in the UI
      // This avoids having to choose the same item again
      if (selectedTarget) {
        setSelectedTarget({
          ...selectedTarget,
          currentTarget: selectedTarget.newTarget
        });
      }
      
    } catch (error) {
      console.error('Error saving target:', error);
      toast.error('Failed to save target. Please try again.');
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
    targetData,
    isLoadingTargets,
    handleOpenTargetDialog,
    handleSelectTarget,
    handleTargetValueChange,
    handleSaveTarget,
    getCurrentTarget,
    fetchTargetData
  };
}; 