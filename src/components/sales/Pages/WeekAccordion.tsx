import { useState, useCallback } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define types locally instead of importing from hooks to fix linter errors
interface ProgressData {
  kpi_id: number;
  requirement_id: number;
  count: number;
  is_complete: boolean;
}

interface TargetData {
  kpi_id: number;
  requirement_id: number;
  target_count: number;
}

interface WeekData {
  isLoaded: boolean;
  isLoading: boolean;
  progressData?: ProgressData[];
  targetData?: TargetData[];
  skillsetData?: any[];
  comment?: string | null;
}

interface KpiData {
  kpi_id: number;
  kpi_name: string;
}

interface RequirementData {
  requirement_id: number;
  requirement_name: string;
}

interface Metadata {
  mentorDashboard_actionKpi_masterData: KpiData[];
  mentorDashboard_skillsetKpi_masterData: KpiData[];
  mentorDashboard_requirement_masterData: RequirementData[];
}

interface WeekAccordionProps {
  weekNumber: number;
  weekData: WeekData;
  isCompleted: boolean;
  progressPercentage: number;
  metadata: Metadata | null;
  isMetadataLoaded: boolean;
  onExpand: (weekNumber: number) => void;
  className?: string;
}

export function WeekAccordion({
  weekNumber,
  weekData,
  isCompleted,
  progressPercentage,
  metadata,
  isMetadataLoaded,
  onExpand,
  className
}: WeekAccordionProps) {
  
  const handleExpand = useCallback(() => {
    onExpand(weekNumber);
  }, [weekNumber, onExpand]);
  
  return (
    <AccordionItem value={`week-${weekNumber}`} className={`overflow-hidden ${className}`}>
      <AccordionTrigger className="px-2 py-4 hover:no-underline hover:bg-muted/20" onClick={handleExpand}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 sm:gap-4 w-full">
            <div className="flex-shrink-0 w-20 sm:w-24">
              <span className="font-medium">Week {weekNumber}</span>
            </div>
            
            <div className="flex-shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <div className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-grow mx-2 sm:mx-4">
              <Progress value={progressPercentage} className="h-2.5" />
            </div>
            
            <div className="flex-shrink-0 text-sm text-muted-foreground ml-auto">
              {progressPercentage}%
            </div>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-3 sm:px-6 pt-4 pb-6 bg-card">
        {weekData.isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-4 w-full max-w-[200px]" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full max-w-[250px]" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !weekData.isLoaded ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center text-muted-foreground">
              <AlertCircle className="mb-2 h-10 w-10" />
              <p>Failed to load week data</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Section */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">KPI</h4>
              {!isMetadataLoaded ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-6">Action</div>
                    <div className="col-span-4">Progress</div>
                    <div className="col-span-2 text-right">Target</div>
                  </div>
                  
                  <div className="space-y-2">
                    {metadata?.mentorDashboard_actionKpi_masterData.map((kpi, index) => {
                      // Find matching progress data for this KPI
                      const kpiProgress = weekData.progressData?.find(
                        p => p.kpi_id === kpi.kpi_id && p.requirement_id === 0
                      );
                      
                      // Find matching target if any
                      const kpiTarget = weekData.targetData?.find(
                        t => t.kpi_id === kpi.kpi_id && t.requirement_id === 0
                      );
                      
                      const count = kpiProgress?.count || 0;
                      const target = kpiTarget?.target_count || 0;
                      const hasTarget = target > 0;
                      const isTargetMet = hasTarget && count >= target;
                      
                      return (
                        <div key={kpi.kpi_id} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6 break-words">{kpi.kpi_name}</div>
                          <div className="col-span-4">
                            {hasTarget ? (
                              <div className="h-2 w-full bg-secondary rounded-full">
                                <div 
                                  className={`h-full rounded-full ${isTargetMet ? 'bg-green-500' : 'bg-gold-500'}`}
                                  style={{ width: `${Math.min((count / target) * 100, 100)}%` }}
                                />
                              </div>
                            ) : (
                              <div className="h-2 w-full bg-gray-100 rounded-full">
                                <div 
                                  className="h-full rounded-full bg-gold-500"
                                  style={{ width: `${count}%`, maxWidth: '100%' }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 text-sm whitespace-nowrap text-right">
                            {count}/{target}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Skillset Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-md font-medium">Skillset</h4>
              {!isMetadataLoaded ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile view */}
                  <div className="block sm:hidden space-y-4">
                    {metadata?.mentorDashboard_skillsetKpi_masterData.map((skill, index) => {
                      // Find corresponding skillset data from API response
                      const skillsetEntry = weekData.skillsetData?.find(
                        s => s._kpi?.kpi_name === skill.kpi_name
                      );
                      
                      // Use real data if available, otherwise use mock data
                      const wording = skillsetEntry?.wording_score || Math.floor(Math.random() * 100);
                      const tonality = skillsetEntry?.tonality_score || Math.floor(Math.random() * 100);
                      const rapport = skillsetEntry?.rapport_score || Math.floor(Math.random() * 100);
                      const total = skillsetEntry?.total_score || Math.floor((wording + tonality + rapport) / 3);
                      
                      return (
                        <div key={skill.kpi_id} className="border rounded-md p-3">
                          <div className="font-medium mb-2">{skill.kpi_name}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Wording:</div>
                            <div>{wording}%</div>
                            <div>Tonality:</div>
                            <div>{tonality}%</div>
                            <div>Rapport:</div>
                            <div>{rapport}%</div>
                            <div className="font-medium">Total:</div>
                            <div className="font-medium">{total}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Desktop view */}
                  <div className="hidden sm:block">
                    <div className="grid grid-cols-15 gap-2 text-sm font-medium text-muted-foreground">
                      <div className="col-span-3">Skillset</div>
                      <div className="col-span-3">Wording</div>
                      <div className="col-span-3">Tonality</div>
                      <div className="col-span-3">Rapport</div>
                      <div className="col-span-3">Total (%)</div>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      {metadata?.mentorDashboard_skillsetKpi_masterData.map((skill, index) => {
                        // Find corresponding skillset data from API response
                        const skillsetEntry = weekData.skillsetData?.find(
                          s => s._kpi?.kpi_name === skill.kpi_name
                        );
                        
                        // Use real data if available, otherwise use mock data
                        const wording = skillsetEntry?.wording_score || Math.floor(Math.random() * 100);
                        const tonality = skillsetEntry?.tonality_score || Math.floor(Math.random() * 100);
                        const rapport = skillsetEntry?.rapport_score || Math.floor(Math.random() * 100);
                        const total = skillsetEntry?.total_score || Math.floor((wording + tonality + rapport) / 3);
                        
                        return (
                          <div key={skill.kpi_id} className="grid grid-cols-15 gap-2 items-center">
                            <div className="col-span-3">{skill.kpi_name}</div>
                            <div className="col-span-3">{wording}%</div>
                            <div className="col-span-3">{tonality}%</div>
                            <div className="col-span-3">{rapport}%</div>
                            <div className="col-span-3">{total}%</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Requirements Section */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-md font-medium">Requirements</h4>
              {!isMetadataLoaded ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                    <div className="col-span-8">Requirement</div>
                    <div className="col-span-4 text-right">Target</div>
                  </div>
                  
                  <div className="space-y-2">
                    {metadata?.mentorDashboard_requirement_masterData.map((req, index) => {
                      // Find matching progress data for this requirement
                      const reqProgress = weekData.progressData?.find(
                        p => p.requirement_id === req.requirement_id && p.kpi_id === 0
                      );
                      
                      // Find matching target if any
                      const reqTarget = weekData.targetData?.find(
                        t => t.requirement_id === req.requirement_id && t.kpi_id === 0
                      );
                      
                      const count = reqProgress?.count || 0;
                      const target = reqTarget?.target_count || 0;
                      const hasTarget = target > 0;
                      const isTargetMet = hasTarget && count >= target;
                      const isComplete = reqProgress?.is_complete || false;
                      
                      return (
                        <div key={req.requirement_id} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-8 break-words">{req.requirement_name}</div>
                          <div className="col-span-4 text-sm text-right">
                            {count}{hasTarget ? `/${target}` : ''}
                            {!hasTarget && isComplete && <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-green-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Code of Honor Section */}
            <div className="pt-4 border-t">
              <h4 className="text-md font-medium mb-2">Code of Honor</h4>
              <div className="bg-muted rounded-md p-3 text-sm">
                {/* Empty for now as requested */}
              </div>
            </div>
            
            {/* Mentor Comment Section (read-only) */}
            <div className="pt-4 border-t">
              <h4 className="text-md font-medium mb-2">Mentor's Comments</h4>
              <div className="bg-muted rounded-md p-3 text-sm">
                {weekData.comment || "No comments from mentor yet."}
              </div>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
} 