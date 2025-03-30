import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { RefreshCw, PlusCircle, MinusCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { xanoService } from "@/services/xanoService";

interface SalesUser {
  id: number;
  user_id: number;
  starting_date: string;
  generation: number;
  property_type: string;
  probation_status: string;
  probation_extended: boolean;
  current_rank: number;
  _user: [{
    full_name: string;
    profile_image: string | null;
  }];
  _rank?: {
    rank_name: string;
  };
}

interface MentorData {
  mentor1: {
    id: number;
    user_id: number;
  };
  result1: SalesUser[];
}

// Mock data for weekly details
interface Action {
  name: string;
  done: number;
  target: number;
}

interface Skillset {
  name: string;
  score: number;
}

interface SkillsetScores {
  wording: number;
  tonality: number;
  rapport: number;
  total?: number;
}

interface Requirement {
  name: string;
  completed: boolean;
}

interface WeeklyPerformance {
  week: number;
  actions: Action[];
  skillsets: Skillset[];
  skillsetScores?: SkillsetScores[];
  requirements: Requirement[];
  comment: string;
}

interface DashboardMetadata {
  mentorDashboard_actionKpi_masterData: { kpi_name: string }[];
  mentorDashboard_skillsetKpi_masterData: { kpi_name: string }[];
  mentorDashboard_requirement_masterData: { requirement_name: string }[];
}

interface SalesProgressData {
  result1: {
    kpi_action_progress_kpi_id: number;
    kpi_action_progress_count: number;
    _kpi: {
      kpi_name: string;
      kpi_type: string;
    };
  }[];
  kpi_skillset_progress_max: {
    kpi_skillset_progress_kpi_id: number;
    kpi_skillset_progress_total_score: number;
  }[];
  requirement_progress1: {
    requirement_progress_requirement_id: number;
    requirement_progress_count: number;
    _requirement: {
      requirement_name: string;
    }[];
  }[];
}

interface TargetState {
  type: 'action' | 'skillset' | 'requirement';
  id: number;
  name: string;
  currentTarget: number;
  newTarget: number;
}

export function MentorMySales() {
  const [salesData, setSalesData] = useState<SalesUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [metadata, setMetadata] = useState<DashboardMetadata | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [salesProgressData, setSalesProgressData] = useState<Record<string, SalesProgressData>>({});
  const [isProgressLoading, setIsProgressLoading] = useState<Record<string, boolean>>({});
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<'action' | 'skillset' | 'requirement'>('action');
  const [selectedTarget, setSelectedTarget] = useState<TargetState | null>(null);
  const [targetSalesId, setTargetSalesId] = useState<number | null>(null);
  const [targetWeek, setTargetWeek] = useState<number | null>(null);

  // Weekly performance data - would be fetched from the API in a real application
  const [weeklyData, setWeeklyData] = useState<Record<number, WeeklyPerformance[]>>({
    1: [
      {
        week: 1,
        actions: [
          { name: "Property Viewing", done: 3, target: 5 },
          { name: "Customer Calls", done: 12, target: 15 },
          { name: "Follow-ups", done: 7, target: 10 }
        ],
        skillsets: [],
        skillsetScores: [
          { 
            wording: 7, 
            tonality: 8, 
            rapport: 6,
            total: (7 + 8 + 6) / 3
          },
          { 
            wording: 8, 
            tonality: 7, 
            rapport: 9,
            total: (8 + 7 + 9) / 3
          }
        ],
        requirements: [],
        comment: ""
      },
      {
        week: 2,
        actions: [
          { name: "Property Viewing", done: 4, target: 5 },
          { name: "Customer Calls", done: 14, target: 15 },
          { name: "Follow-ups", done: 8, target: 10 }
        ],
        skillsets: [],
        skillsetScores: [
          { 
            wording: 8, 
            tonality: 8, 
            rapport: 7,
            total: (8 + 8 + 7) / 3
          },
          { 
            wording: 9, 
            tonality: 8, 
            rapport: 8,
            total: (9 + 8 + 8) / 3
          }
        ],
        requirements: [],
        comment: ""
      }
    ]
  });

  const fetchMySales = async () => {
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
  };

  const fetchMetadata = async () => {
    try {
      setIsMetadataLoading(true);
      const data = await xanoService.getMentorDashboardMetadata();
      console.log('Mentor dashboard metadata:', data);
      
      if (data) {
        setMetadata(data);
        
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
  };

  const updateWeeklyDataWithMetadata = (metadata: DashboardMetadata) => {
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
  };

  const handleWeekChange = (salesId: number, week: string) => {
    const weekNumber = parseInt(week);
    setSelectedWeeks(prev => ({
      ...prev,
      [salesId]: weekNumber
    }));
    
    // Fetch progress data for the selected sales and week
    fetchSalesProgress(salesId, weekNumber);
  };
  
  const fetchSalesProgress = async (salesId: number, weekNumber: number, forceRefresh = false) => {
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
  };
  
  useEffect(() => {
    fetchMySales();
    fetchMetadata();
  }, []);
  
  // Fetch initial progress data when sales data is loaded
  useEffect(() => {
    if (salesData.length > 0 && Object.keys(selectedWeeks).length > 0) {
      salesData.forEach(sales => {
        const selectedWeek = selectedWeeks[sales.id] || 1;
        fetchSalesProgress(sales.id, selectedWeek);
      });
    }
  }, [salesData, selectedWeeks]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || 'N/A';
    }
  };

  const getProbationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleCommentChange = (salesId: number, week: number, comment: string) => {
    const key = `${salesId}-${week}`;
    setComments(prev => ({
      ...prev,
      [key]: comment
    }));
  };

  const getCommentValue = (salesId: number, week: number) => {
    const key = `${salesId}-${week}`;
    return comments[key] || weeklyData[salesId]?.[week - 1]?.comment || "";
  };

  const calculateTotalSkillsetScore = (skillsets: Skillset[]) => {
    return skillsets.reduce((sum, skillset) => sum + skillset.score, 0);
  };

  const formatSkillPercentage = (score: number) => {
    return `${Math.round((score / 10) * 100)}%`;
  };

  // Get the skillset names from metadata or use defaults
  const getSkillsetNames = (index: number) => {
    if (metadata?.mentorDashboard_skillsetKpi_masterData) {
      return metadata.mentorDashboard_skillsetKpi_masterData[index]?.kpi_name || `Skillset ${index + 1}`;
    }
    return `Skillset ${index + 1}`;
  };

  // Get the progress data for a specific sales and week
  const getSalesProgressData = (salesId: number, weekNumber: number) => {
    const key = `${salesId}-${weekNumber}`;
    return salesProgressData[key];
  };
  
  // Check if progress data is loading
  const isProgressDataLoading = (salesId: number, weekNumber: number) => {
    const key = `${salesId}-${weekNumber}`;
    return !!isProgressLoading[key];
  };

  // Get progress data and statistics
  const calculateWeeklyProgressPercentage = (salesId: number, weekNumber: number) => {
    // If we have metadata but no progress data yet, return 0
    if (!getSalesProgressData(salesId, weekNumber)) {
      return 0;
    }
    
    // Calculate the overall percentage based on all three categories
    const kpiPercentage = getCompletedKPIsCount(salesId, weekNumber) / getTotalKPIsCount(salesId, weekNumber) || 0;
    const skillsetPercentage = getCompletedSkillsetsCount(salesId, weekNumber) / getTotalSkillsetsCount() || 0;
    const requirementPercentage = getCompletedRequirementsCount(salesId, weekNumber) / getTotalRequirementsCount() || 0;
    
    // Calculate average percentage across all categories
    const overallPercentage = ((kpiPercentage + skillsetPercentage + requirementPercentage) / 3) * 100;
    return Math.round(overallPercentage);
  };

  const getCompletedKPIsCount = (salesId: number, weekNumber: number) => {
    const key = `${salesId}-${weekNumber}`;
    if (salesProgressData[key] && salesProgressData[key].result1) {
      // Count KPIs that meet the target (for demo, count > 50)
      return salesProgressData[key].result1.filter(action => action.kpi_action_progress_count >= 50).length;
    }
    return 0;
  };

  const getTotalKPIsCount = (salesId: number, weekNumber: number) => {
    const progressData = getSalesProgressData(salesId, weekNumber);
    if (progressData && progressData.result1) {
      return progressData.result1.length;
    }
    
    // If no progress data yet, use metadata
    if (metadata?.mentorDashboard_actionKpi_masterData) {
      return metadata.mentorDashboard_actionKpi_masterData.length;
    }
    
    return 0;
  };

  const getCompletedSkillsetsCount = (salesId: number, weekNumber: number) => {
    const key = `${salesId}-${weekNumber}`;
    if (salesProgressData[key] && salesProgressData[key].kpi_skillset_progress_max) {
      // Count skillsets that meet the target (for demo, score > 70)
      return salesProgressData[key].kpi_skillset_progress_max.filter(
        skillset => skillset.kpi_skillset_progress_total_score >= 70
      ).length;
    }
    return 0;
  };

  const getTotalSkillsetsCount = () => {
    // Use metadata for total count
    if (metadata?.mentorDashboard_skillsetKpi_masterData) {
      return metadata.mentorDashboard_skillsetKpi_masterData.length;
    }
    return 0;
  };

  const getCompletedRequirementsCount = (salesId: number, weekNumber: number) => {
    const key = `${salesId}-${weekNumber}`;
    if (salesProgressData[key] && salesProgressData[key].requirement_progress1) {
      // Count requirements that meet the target (for demo, count >= 1)
      return salesProgressData[key].requirement_progress1.filter(req => req.requirement_progress_count >= 1).length;
    }
    return 0;
  };

  const getTotalRequirementsCount = () => {
    // Use metadata for total count
    if (metadata?.mentorDashboard_requirement_masterData) {
      return metadata.mentorDashboard_requirement_masterData.length;
    }
    return 0;
  };

  const handleRefresh = async () => {
    await fetchMySales();
    
    // After sales data is refreshed, reload progress data for all sales
    salesData.forEach(sales => {
      const selectedWeek = selectedWeeks[sales.id] || 1;
      
      // Fetch fresh progress data with forceRefresh=true
      fetchSalesProgress(sales.id, selectedWeek, true);
    });
    
    toast.success("Data refreshed successfully");
  };

  // Handle opening the target dialog
  const handleOpenTargetDialog = (salesId: number, weekNumber: number) => {
    setTargetSalesId(salesId);
    setTargetWeek(weekNumber);
    setTargetCategory('action');
    setIsTargetModalOpen(true);
  };

  // Handle target selection
  const handleSelectTarget = (type: 'action' | 'skillset' | 'requirement', id: number, name: string, currentTarget: number = 0) => {
    setSelectedTarget({
      type,
      id,
      name,
      currentTarget,
      newTarget: currentTarget
    });
  };

  // Handle target value change
  const handleTargetValueChange = (value: string) => {
    if (selectedTarget) {
      setSelectedTarget({
        ...selectedTarget,
        newTarget: parseInt(value) || 0
      });
    }
  };

  // Handle saving the target
  const handleSaveTarget = async () => {
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
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Sales</h2>
            <p className="text-muted-foreground">View and manage your assigned sales agents</p>
          </div>
          
          <Button 
            onClick={handleRefresh}
            variant="outline" 
            className="border-gold-500 text-gold-500 hover:bg-gold-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && salesData.length === 0 && (
          <Card className="border border-border/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-10 text-center">
                <h3 className="text-lg font-medium">No sales agents assigned</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You don't have any sales agents assigned to you yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Set Target Modal */}
        <Dialog open={isTargetModalOpen} onOpenChange={setIsTargetModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Performance Targets</DialogTitle>
              <DialogDescription>
                Set targets for each performance metric that the sales agent should achieve.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="action" value={targetCategory} onValueChange={(value) => setTargetCategory(value as 'action' | 'skillset' | 'requirement')}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="action">Actions</TabsTrigger>
                <TabsTrigger value="skillset">Skillsets</TabsTrigger>
                <TabsTrigger value="requirement">Requirements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="action" className="mt-4">
                <div className="space-y-4">
                  <div className="text-sm font-medium">Select an action to set its target:</div>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {metadata?.mentorDashboard_actionKpi_masterData?.map((kpi, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedTarget?.type === 'action' && selectedTarget?.id === index
                            ? 'border-gold-500 bg-gold-50'
                            : 'hover:border-gold-200'
                        }`}
                        onClick={() => handleSelectTarget('action', index, kpi.kpi_name)}
                      >
                        <div className="font-medium">{kpi.kpi_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Current target: N/A
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="skillset" className="mt-4">
                <div className="space-y-4">
                  <div className="text-sm font-medium">Select a skillset to set its target:</div>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {metadata?.mentorDashboard_skillsetKpi_masterData?.map((kpi, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedTarget?.type === 'skillset' && selectedTarget?.id === index
                            ? 'border-gold-500 bg-gold-50'
                            : 'hover:border-gold-200'
                        }`}
                        onClick={() => handleSelectTarget('skillset', index, kpi.kpi_name)}
                      >
                        <div className="font-medium">{kpi.kpi_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Current target: N/A
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="requirement" className="mt-4">
                <div className="space-y-4">
                  <div className="text-sm font-medium">Select a requirement to set its target:</div>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {metadata?.mentorDashboard_requirement_masterData?.map((req, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedTarget?.type === 'requirement' && selectedTarget?.id === index
                            ? 'border-gold-500 bg-gold-50'
                            : 'hover:border-gold-200'
                        }`}
                        onClick={() => handleSelectTarget('requirement', index, req.requirement_name)}
                      >
                        <div className="font-medium">{req.requirement_name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Current target: N/A
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {selectedTarget && (
              <>
                <Separator />
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="text-sm font-medium mb-2">Set target for: {selectedTarget.name}</div>
                    <Input 
                      type="number" 
                      min="0"
                      value={selectedTarget.newTarget.toString()}
                      onChange={(e) => handleTargetValueChange(e.target.value)}
                      placeholder="Enter target value"
                    />
                  </div>
                </div>
              </>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTargetModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTarget}
                disabled={!selectedTarget}
                className="bg-gold-500 hover:bg-gold-600 text-white"
              >
                Save Target
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sales Accordions */}
        {!isLoading && !error && salesData.length > 0 && (
          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {salesData.map((sales) => {
                const salesUser = sales._user[0];
                const selectedWeek = selectedWeeks[sales.id] || 1;
                
                // In a real application, you would fetch this data from the API
                // Here we're using mock data
                const weeklyPerformanceData = weeklyData[1]?.[selectedWeek - 1] || {
                  week: selectedWeek,
                  actions: [],
                  skillsets: [],
                  skillsetScores: [],
                  requirements: [],
                  comment: ""
                };
                
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Starting Date</h4>
                          <p>{formatDate(sales.starting_date)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Property Type</h4>
                          <p>{sales.property_type || "N/A"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Probation</h4>
                          <div className="flex items-center gap-2">
                            <span>{sales.probation_status}</span>
                            {sales.probation_extended && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                Extended
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Week Selection */}
                      <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">Week {selectedWeek} Performance</h3>
                            <div className="w-32">
                              <Select
                                value={selectedWeek.toString()}
                                onValueChange={(value) => handleWeekChange(sales.id, value)}
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
                            onClick={() => handleOpenTargetDialog(sales.id, selectedWeek)}
                          >
                            <Target className="mr-1 h-3 w-3" />
                            Set Target
                          </Button>
                        </div>
                        <Separator className="my-4" />
                      </div>

                      {/* Weekly Progress Summary */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-md font-medium">Weekly Progress</h4>
                          <span className="text-sm font-medium text-muted-foreground">
                            {calculateWeeklyProgressPercentage(sales.id, selectedWeek)}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full">
                          <div 
                            className={`h-full rounded-full ${
                              calculateWeeklyProgressPercentage(sales.id, selectedWeek) >= 70 
                                ? 'bg-green-500' 
                                : 'bg-gold-500'
                            }`}
                            style={{ width: `${calculateWeeklyProgressPercentage(sales.id, selectedWeek)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>KPIs: {getCompletedKPIsCount(sales.id, selectedWeek)}/{getTotalKPIsCount(sales.id, selectedWeek)}</span>
                          <span>Skillsets: {getCompletedSkillsetsCount(sales.id, selectedWeek)}/{getTotalSkillsetsCount()}</span>
                          <span>Requirements: {getCompletedRequirementsCount(sales.id, selectedWeek)}/{getTotalRequirementsCount()}</span>
                        </div>
                      </div>

                      {/* KPI and Actions */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium mb-3">KPI</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                            <div className="col-span-4">Action</div>
                            <div className="col-span-5">Progress</div>
                            <div className="col-span-3">Completion</div>
                          </div>
                          
                          {/* Loading state */}
                          {isProgressDataLoading(sales.id, selectedWeek) && (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
                            </div>
                          )}
                          
                          {/* Display real KPI action data */}
                          {!isProgressDataLoading(sales.id, selectedWeek) && (
                            <>
                              {metadata?.mentorDashboard_actionKpi_masterData?.map((kpi, index) => {
                                // Find the corresponding progress data if it exists
                                const actionProgress = getSalesProgressData(sales.id, selectedWeek)?.result1?.find(
                                  action => action._kpi.kpi_name === kpi.kpi_name
                                );
                                
                                // Use the actual value if available, otherwise use 0
                                const count = actionProgress?.kpi_action_progress_count || 0;
                                // Default target value - for now, display N/A until the API provides target values
                                const hasTarget = false; // This will be true when API provides target values
                                // For demo, use 50 as the mock target to show the color change logic
                                const mockTarget = 50;
                                const isTargetMet = count >= mockTarget;
                                
                                return (
                                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-4">{kpi.kpi_name}</div>
                                    <div className="col-span-5">
                                      {hasTarget ? (
                                        <Progress 
                                          value={(count / 100) * 100} 
                                          className={`h-2 ${isTargetMet ? 'bg-secondary [&>div]:bg-green-500' : 'bg-secondary [&>div]:bg-gold-500'}`}
                                        />
                                      ) : (
                                        <div className="h-2 w-full bg-gray-100 rounded-full">
                                          <div 
                                            className={`h-full rounded-full ${isTargetMet ? 'bg-green-500' : 'bg-gold-500'}`}
                                            style={{ width: `${count}%`, maxWidth: '100%' }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div className="col-span-3 text-sm">
                                      {count} {hasTarget ? '/ 100' : '/ N/A'}
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {/* Show a message if no metadata is available */}
                              {(!metadata?.mentorDashboard_actionKpi_masterData || 
                                metadata.mentorDashboard_actionKpi_masterData.length === 0) && (
                                <div className="py-4 text-center text-muted-foreground">
                                  No KPI data available
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Skillsets */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium mb-3">Skillsets</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Skillset</th>
                                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Score</th>
                                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Target</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {/* Loading state */}
                              {isProgressDataLoading(sales.id, selectedWeek) && (
                                <tr>
                                  <td colSpan={3} className="py-4 text-center">
                                    <div className="flex justify-center">
                                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              
                              {/* Display real skillset data */}
                              {!isProgressDataLoading(sales.id, selectedWeek) && 
                               metadata?.mentorDashboard_skillsetKpi_masterData?.map((skillset, index) => {
                                // Find the corresponding skill score from the API
                                const skillScore = getSalesProgressData(sales.id, selectedWeek)?.kpi_skillset_progress_max?.find(
                                  s => s.kpi_skillset_progress_kpi_id === index + 8 // Add 8 because the IDs start from 8 in the sample data
                                );
                                
                                // Use 0 if no score is found
                                const score = skillScore?.kpi_skillset_progress_total_score || 0;
                                // For demo, use 70 as the mock target to show the color change logic
                                const mockTarget = 70;
                                const isTargetMet = score >= mockTarget;
                                
                                return (
                                  <tr key={index}>
                                    <td className="py-2 px-2">{skillset.kpi_name}</td>
                                    <td className="text-center py-2 px-2">
                                      <Badge className={isTargetMet ? "bg-green-100 text-green-800" : "bg-gold-100 text-gold-800"}>
                                        {formatSkillPercentage(score / 10)}
                                      </Badge>
                                    </td>
                                    <td className="text-center py-2 px-2 text-muted-foreground text-sm">
                                      N/A
                                    </td>
                                  </tr>
                                );
                              })}
                              
                              {/* Show a message if no metadata is available */}
                              {!isProgressDataLoading(sales.id, selectedWeek) && 
                                (!metadata?.mentorDashboard_skillsetKpi_masterData || 
                                metadata.mentorDashboard_skillsetKpi_masterData.length === 0) && (
                                <tr>
                                  <td colSpan={3} className="py-4 text-center text-muted-foreground">
                                    No skillset data available
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium mb-3">Requirements</h4>
                        <div className="space-y-2">
                          {/* Loading state */}
                          {isProgressDataLoading(sales.id, selectedWeek) && (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
                            </div>
                          )}
                          
                          {/* Display real requirement data */}
                          {!isProgressDataLoading(sales.id, selectedWeek) && (
                            <>
                              {metadata?.mentorDashboard_requirement_masterData?.map((req, index) => {
                                // Find the corresponding requirement progress if it exists
                                const reqProgress = getSalesProgressData(sales.id, selectedWeek)?.requirement_progress1?.find(
                                  r => r._requirement[0]?.requirement_name === req.requirement_name
                                );
                                
                                // Use the actual count if available, otherwise use 0
                                const count = reqProgress?.requirement_progress_count || 0;
                                // For demo, use 1 as the mock target to show the color change logic
                                const mockTarget = 1;
                                const isTargetMet = count >= mockTarget;
                                
                                return (
                                  <div key={index} className="flex items-center justify-between">
                                    <span>{req.requirement_name}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className={isTargetMet ? "bg-green-100 text-green-800" : "bg-gold-100 text-gold-800"}>
                                        {count}
                                      </Badge>
                                      <span className="text-muted-foreground text-sm">/ N/A</span>
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {/* Show a message if no metadata is available */}
                              {(!metadata?.mentorDashboard_requirement_masterData || 
                                metadata.mentorDashboard_requirement_masterData.length === 0) && (
                                <div className="py-4 text-center text-muted-foreground">
                                  No requirements data available
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Code of Honor */}
                      <div className="mb-6">
                        <h4 className="text-md font-medium mb-3">Code of Honor</h4>
                        <div className="rounded-md border border-dashed p-4 text-center text-muted-foreground">
                          Code of Honor content will be added soon
                        </div>
                      </div>

                      {/* Mentor Comment */}
                      <div>
                        <h4 className="text-md font-medium mb-3">Mentor Comment</h4>
                        <Textarea 
                          placeholder="Add your comments about this week's performance"
                          className="min-h-[100px]"
                          value={getCommentValue(sales.id, selectedWeek)}
                          onChange={(e) => handleCommentChange(sales.id, selectedWeek, e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                          <Button 
                            variant="outline" 
                            className="border-gold-500 text-gold-500 hover:bg-gold-50"
                            onClick={() => toast.success("Comment saved successfully")}
                          >
                            Save Comment
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </motion.div>
    </div>
  );
}
