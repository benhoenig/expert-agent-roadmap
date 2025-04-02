import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { KPIProgressForm } from "./KPIProgressForm";
import { RequirementProgressForm } from "./RequirementProgressForm";
import { xanoService } from "@/services/xanoService";

const AddProgressButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("kpi");
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch metadata on first open
  const fetchMetadata = async () => {
    if (metadata) return; // Only fetch if not already loaded
    
    try {
      setIsLoading(true);
      const response = await xanoService.getSalesInterfaceMetadata();
      setMetadata(response);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchMetadata();
    }
  };
  
  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50 bg-black hover:bg-black/80"
        onClick={() => handleOpen(true)}
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Progress</DialogTitle>
            <DialogDescription>
              Track your progress by adding KPIs and requirements.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kpi">KPI</TabsTrigger>
              <TabsTrigger value="requirement">Requirement</TabsTrigger>
            </TabsList>
            
            <TabsContent value="kpi">
              <KPIProgressForm metadata={metadata} isLoading={isLoading} onSuccess={() => setIsOpen(false)} />
            </TabsContent>
            
            <TabsContent value="requirement">
              <RequirementProgressForm metadata={metadata} isLoading={isLoading} onSuccess={() => setIsOpen(false)} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddProgressButton; 