import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { toast } from "sonner";
import { useSalesData, useMetadata, useProgressData, useComments, useTargetModal } from "./hooks";
import { TargetModal } from "./TargetModal";
import { SalesCard } from "./SalesCard";

export function MentorMySales() {
  // Use custom hooks for state management
  const { 
    salesData, 
    isLoading, 
    error, 
    selectedWeeks, 
    setSelectedWeeks, 
    refreshSalesData 
  } = useSalesData();
  
  const { 
    metadata, 
    isMetadataLoading, 
    weeklyData, 
    refreshMetadata 
  } = useMetadata();
  
  const { 
    salesProgressData, 
    isProgressLoading, 
    fetchSalesProgress, 
    refreshAllProgressData 
  } = useProgressData(salesData, selectedWeeks);
  
  const { 
    comments, 
    handleCommentChange, 
    getCommentValue, 
    saveComment 
  } = useComments();
  
  const {
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
  } = useTargetModal();

  // State to track which accordion item is expanded
  const [expandedSalesId, setExpandedSalesId] = useState<string | null>(null);
  
  // Handle accordion state change
  const handleAccordionChange = (value: string) => {
    setExpandedSalesId(value === expandedSalesId ? null : value);
  };

  // Additional logging to help diagnose issues
  useEffect(() => {
    if (salesData.length > 0 && Object.keys(selectedWeeks).length > 0) {
      console.log("Sales data loaded:", {
        salesCount: salesData.length,
        selectedWeeks
      });
      
      // We removed the preloadTargetData function because it was loading data
      // for all sales cards even when they weren't visible to the user.
      // Target data will now be loaded only when an accordion is expanded or
      // when the target modal is opened, which is more efficient.
    }
  }, [salesData, selectedWeeks]);

  // Only log modal state changes rather than on every render
  useEffect(() => {
    if (isTargetModalOpen) {
      console.log("Modal opened:", { 
        targetSalesId, 
        targetWeek, 
        targetCategory,
        targetDataLength: targetData.length
      });
    }
  }, [isTargetModalOpen, targetSalesId, targetWeek, targetCategory, targetData.length]);

  const handleWeekChange = (salesId: number, week: string) => {
    const weekNumber = parseInt(week);
    setSelectedWeeks(prev => ({
      ...prev,
      [salesId]: weekNumber
    }));
    
    // Allow a small delay before fetching to avoid rate limits
    setTimeout(() => {
      // Fetch progress data for the selected sales and week
      fetchSalesProgress(salesId, weekNumber);
      
      // Also fetch target data for the selected week
      fetchTargetData(salesId, weekNumber);
    }, 500);
  };

  const handleRefresh = () => {
    // Simple page reload without any state management
    // This completely refreshes the page and all state/data
    toast.loading("Refreshing page...");
    window.location.reload();
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

        {/* Target Modal */}
        <TargetModal
          isOpen={isTargetModalOpen}
          onOpenChange={setIsTargetModalOpen}
          targetCategory={targetCategory}
          setTargetCategory={setTargetCategory}
          selectedTarget={selectedTarget}
          handleSelectTarget={handleSelectTarget}
          handleTargetValueChange={handleTargetValueChange}
          handleSaveTarget={handleSaveTarget}
          metadata={metadata}
          targetData={targetData}
          isLoadingTargets={isLoadingTargets}
          getCurrentTarget={getCurrentTarget}
          targetSalesId={targetSalesId || undefined}
          targetWeek={targetWeek || undefined}
        />

        {/* Sales Accordions */}
        {!isLoading && !error && salesData.length > 0 && (
          <div className="space-y-6">
            <Accordion 
              type="single" 
              collapsible 
              className="w-full space-y-4"
              value={expandedSalesId || ""}
              onValueChange={handleAccordionChange}
            >
              {salesData.map((sales) => {
                const selectedWeek = selectedWeeks[sales.id] || 1;
                const isSalesExpanded = expandedSalesId === `sales-${sales.id}`;
                
                return (
                  <SalesCard
                    key={sales.id}
                    sales={sales}
                    selectedWeek={selectedWeek}
                    handleWeekChange={handleWeekChange}
                    handleOpenTargetDialog={handleOpenTargetDialog}
                    metadata={metadata}
                    salesProgressData={salesProgressData}
                    isProgressLoading={isProgressLoading}
                    getCommentValue={getCommentValue}
                    handleCommentChange={handleCommentChange}
                    saveComment={saveComment}
                    weeklyData={weeklyData}
                    targetData={targetData}
                    getCurrentTarget={getCurrentTarget}
                    isExpanded={isSalesExpanded}
                    fetchTargetData={fetchTargetData}
                  />
                );
              })}
            </Accordion>
          </div>
        )}
      </motion.div>
    </div>
  );
} 