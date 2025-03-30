import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardMetadata, TargetState } from "./types";

interface TargetModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetCategory: 'action' | 'skillset' | 'requirement';
  setTargetCategory: (category: 'action' | 'skillset' | 'requirement') => void;
  selectedTarget: TargetState | null;
  handleSelectTarget: (type: 'action' | 'skillset' | 'requirement', id: number, name: string) => void;
  handleTargetValueChange: (value: string) => void;
  handleSaveTarget: () => void;
  metadata: DashboardMetadata | null;
  targetData: any[];
  isLoadingTargets: boolean;
  getCurrentTarget: (type: 'action' | 'skillset' | 'requirement', id: number, salesId?: number, week?: number) => number;
  targetSalesId?: number;
  targetWeek?: number;
}

export function TargetModal({
  isOpen,
  onOpenChange,
  targetCategory,
  setTargetCategory,
  selectedTarget,
  handleSelectTarget,
  handleTargetValueChange,
  handleSaveTarget,
  metadata,
  targetData,
  isLoadingTargets,
  getCurrentTarget,
  targetSalesId,
  targetWeek
}: TargetModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isOpen && (
          <>
            <DialogHeader>
              <DialogTitle>Set Performance Targets</DialogTitle>
              <DialogDescription>
                Set targets for each performance metric that the sales agent should achieve.
              </DialogDescription>
            </DialogHeader>
            
            {isLoadingTargets ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
              </div>
            ) : (
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
                      {metadata?.mentorDashboard_actionKpi_masterData?.map((kpi, index) => {
                        const currentTarget = getCurrentTarget('action', index, targetSalesId || undefined, targetWeek || undefined);
                        
                        return (
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
                              Current target: {currentTarget > 0 ? currentTarget : 'N/A'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="skillset" className="mt-4">
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Select a skillset to set its target:</div>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                      {metadata?.mentorDashboard_skillsetKpi_masterData?.map((kpi, index) => {
                        const currentTarget = getCurrentTarget('skillset', index, targetSalesId || undefined, targetWeek || undefined);
                        
                        return (
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
                              Current target: {currentTarget > 0 ? currentTarget : 'N/A'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="requirement" className="mt-4">
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Select a requirement to set its target:</div>
                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                      {metadata?.mentorDashboard_requirement_masterData?.map((req, index) => {
                        const currentTarget = getCurrentTarget('requirement', index, targetSalesId || undefined, targetWeek || undefined);
                        
                        return (
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
                              Current target: {currentTarget > 0 ? currentTarget : 'N/A'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            {selectedTarget && !isLoadingTargets && (
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
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  handleSaveTarget();
                }}
                disabled={!selectedTarget || isLoadingTargets}
                className="bg-gold-500 hover:bg-gold-600 text-white cursor-pointer"
              >
                Save Target
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 