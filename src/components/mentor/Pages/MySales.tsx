import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { RefreshCw, PlusCircle, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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

export function MentorMySales() {
  const [salesData, setSalesData] = useState<SalesUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [metadata, setMetadata] = useState<DashboardMetadata | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);

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

  useEffect(() => {
    fetchMySales();
    fetchMetadata();
  }, []);

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

  const handleWeekChange = (salesId: number, week: string) => {
    setSelectedWeeks(prev => ({
      ...prev,
      [salesId]: parseInt(week)
    }));
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
            onClick={fetchMySales}
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
                        <div className="flex items-center gap-2 mb-2">
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
                                <SelectItem value="1">Week 1</SelectItem>
                                <SelectItem value="2">Week 2</SelectItem>
                                <SelectItem value="3">Week 3</SelectItem>
                                <SelectItem value="4">Week 4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Separator className="my-4" />
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
                          
                          {weeklyPerformanceData.actions.map((action, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-4">{action.name}</div>
                              <div className="col-span-5">
                                <Progress value={(action.done / action.target) * 100} className="h-2" />
                              </div>
                              <div className="col-span-3 text-sm">
                                {action.done} / {action.target}
                              </div>
                            </div>
                          ))}
                          
                          {weeklyPerformanceData.actions.length === 0 && isMetadataLoading && (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
                            </div>
                          )}
                          
                          {weeklyPerformanceData.actions.length === 0 && !isMetadataLoading && (
                            <div className="py-4 text-center text-muted-foreground">
                              No KPI data available for this week
                            </div>
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
                                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Wording</th>
                                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Tonality</th>
                                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Rapport</th>
                                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {weeklyPerformanceData.skillsetScores?.map((skillset, index) => (
                                <tr key={index}>
                                  <td className="py-2 px-2">{getSkillsetNames(index)}</td>
                                  <td className="text-center py-2 px-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {formatSkillPercentage(skillset.wording)}
                                    </Badge>
                                  </td>
                                  <td className="text-center py-2 px-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {formatSkillPercentage(skillset.tonality)}
                                    </Badge>
                                  </td>
                                  <td className="text-center py-2 px-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {formatSkillPercentage(skillset.rapport)}
                                    </Badge>
                                  </td>
                                  <td className="text-center py-2 px-2">
                                    <Badge className="bg-gold-100 text-gold-800">
                                      {skillset.total ? formatSkillPercentage(skillset.total) : '0%'}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                              {!weeklyPerformanceData.skillsetScores?.length && (
                                <tr>
                                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                                    {isMetadataLoading ? (
                                      <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
                                      </div>
                                    ) : (
                                      "No skillset data available for this week"
                                    )}
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
                          {weeklyPerformanceData.requirements.map((requirement, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span>{requirement.name}</span>
                              <Badge variant="outline" className={requirement.completed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}>
                                {requirement.completed ? "1" : "0"}
                              </Badge>
                            </div>
                          ))}
                          {weeklyPerformanceData.requirements.length === 0 && isMetadataLoading && (
                            <div className="flex justify-center py-4">
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gold-500"></div>
                            </div>
                          )}
                          {weeklyPerformanceData.requirements.length === 0 && !isMetadataLoading && (
                            <div className="py-4 text-center text-muted-foreground">
                              No requirements data available for this week
                            </div>
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
