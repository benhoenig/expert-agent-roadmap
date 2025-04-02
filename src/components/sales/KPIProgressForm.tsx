import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, Plus, Minus, FileUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { xanoService } from "@/services/xanoService";
import { toast } from "sonner";

interface KPIProgressFormProps {
  metadata: any;
  isLoading: boolean;
  onSuccess: () => void;
}

type KPIType = "Action" | "Skillset";

export const KPIProgressForm = ({ metadata, isLoading, onSuccess }: KPIProgressFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekNumber, setWeekNumber] = useState<string>("1");
  const [kpiType, setKpiType] = useState<KPIType>("Action");
  const [kpiId, setKpiId] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [count, setCount] = useState<number>(1);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [currentSalesId, setCurrentSalesId] = useState<number | null>(null);
  
  // Skillset specific fields
  const [wording, setWording] = useState<number>(0);
  const [tonality, setTonality] = useState<number>(0);
  const [rapport, setRapport] = useState<number>(0);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSalesId, setIsLoadingSalesId] = useState(false);
  
  // Create array of weeks 1-12
  const weeks = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  // Calculate the average score for skillset
  const averageScore = Math.round((wording + tonality + rapport) / 3);
  
  // Helper to get formatted date
  const formattedDate = format(selectedDate, "yyyy-MM-dd");
  
  // Fetch current sales ID on component mount
  useEffect(() => {
    const fetchCurrentSalesId = async () => {
      try {
        setIsLoadingSalesId(true);
        const salesData = await xanoService.getSalesInterface();
        if (salesData && salesData.id) {
          setCurrentSalesId(salesData.id);
        }
      } catch (error) {
        console.error("Error fetching sales ID:", error);
      } finally {
        setIsLoadingSalesId(false);
      }
    };
    
    fetchCurrentSalesId();
  }, []);
  
  // Reset KPI specific fields when KPI type changes
  useEffect(() => {
    setKpiId("");
    if (kpiType === "Action") {
      setCount(1);
      setWording(0);
      setTonality(0);
      setRapport(0);
    }
  }, [kpiType]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!kpiId) {
      toast.error("Please select a KPI");
      return;
    }
    
    try {
      setIsSaving(true);
      
      if (kpiType === "Action") {
        if (!currentSalesId) {
          toast.error("Sales ID not found. Please refresh the page.");
          setIsSaving(false);
          return;
        }
        
        // Submit action KPI progress with new payload format
        const actionPayload = {
          sales_id: currentSalesId,
          week_number: parseInt(weekNumber),
          kpi_id: parseInt(kpiId),
          date_added: formattedDate,
          count: count,
          remark: remarks || null,
          attachment: null // TODO: Implement file upload
        };
        
        await xanoService.addKpiActionProgress(actionPayload);
        toast.success("Action progress added successfully");
      } else {
        // Skillset KPI progress
        if (!currentSalesId) {
          toast.error("Sales ID not found. Please refresh the page.");
          setIsSaving(false);
          return;
        }
        
        // Calculate the average score
        const totalScore = Math.round((wording + tonality + rapport) / 3);
        
        // Submit skillset KPI progress with new payload format
        const skillsetPayload = {
          sales_id: currentSalesId,
          week_number: parseInt(weekNumber),
          kpi_id: parseInt(kpiId),
          date_added: formattedDate,
          wording_score: wording,
          tonality_score: tonality,
          rapport_score: rapport,
          total_score: totalScore,
          remark: remarks || null,
          attachment: null // TODO: Implement file upload
        };
        
        await xanoService.addKpiSkillsetProgress(skillsetPayload);
        toast.success("Skillset progress added successfully");
      }
      
      onSuccess();
      
      // Reset form
      setKpiId("");
      setRemarks("");
      setCount(1);
      setWording(0);
      setTonality(0);
      setRapport(0);
      setAttachment(null);
      
    } catch (error) {
      console.error(`Error adding ${kpiType} progress:`, error);
      toast.error(`Failed to add progress. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };
  
  // Get the appropriate KPI list based on selected type
  const getKpiOptions = () => {
    if (!metadata) return [];
    
    if (kpiType === "Action") {
      return metadata.result1 || [];
    } else {
      return metadata.salesInterface_skillsetKpi_masterData || [];
    }
  };
  
  // Increment/decrement counter for actions
  const incrementCount = () => setCount(prev => Math.min(prev + 1, 100));
  const decrementCount = () => setCount(prev => Math.max(prev - 1, 1));
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* Date Selection */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Week Number Selection */}
      <div className="space-y-2">
        <Label htmlFor="weekNumber">Week Number</Label>
        <Select 
          value={weekNumber} 
          onValueChange={setWeekNumber}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select week" />
          </SelectTrigger>
          <SelectContent>
            {weeks.map((week) => (
              <SelectItem key={week} value={week}>
                Week {week}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* KPI Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="kpiType">KPI Type</Label>
        <Select 
          value={kpiType} 
          onValueChange={(value) => setKpiType(value as KPIType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select KPI type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Action">Action</SelectItem>
            <SelectItem value="Skillset">Skillset</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* KPI Name Selection - Dynamic based on type */}
      <div className="space-y-2">
        <Label htmlFor="kpiName">KPI Name</Label>
        <Select 
          value={kpiId} 
          onValueChange={setKpiId}
          disabled={isLoading || !metadata}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Loading..." : "Select KPI name"} />
          </SelectTrigger>
          <SelectContent>
            {getKpiOptions().map((kpi: any, index: number) => (
              <SelectItem 
                key={kpiType === "Action" ? index + 1 : index + 8} 
                value={kpiType === "Action" ? (index + 1).toString() : (index + 8).toString()}
              >
                {kpi.kpi_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Dynamic section based on KPI type */}
      {kpiType === "Action" ? (
        <div className="space-y-2">
          <Label htmlFor="count">Count</Label>
          <div className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={decrementCount}
              disabled={count <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="count"
              type="number"
              value={count}
              onChange={(e) => setCount(Math.min(Math.max(parseInt(e.target.value) || 1, 1), 100))}
              min={1}
              max={100}
              className="text-center"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={incrementCount}
              disabled={count >= 100}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wording">Wording (%)</Label>
            <Input
              id="wording"
              type="number"
              value={wording}
              onChange={(e) => setWording(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100))}
              min={0}
              max={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tonality">Tonality (%)</Label>
            <Input
              id="tonality"
              type="number"
              value={tonality}
              onChange={(e) => setTonality(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100))}
              min={0}
              max={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rapport">Rapport (%)</Label>
            <Input
              id="rapport"
              type="number"
              value={rapport}
              onChange={(e) => setRapport(Math.min(Math.max(parseInt(e.target.value) || 0, 0), 100))}
              min={0}
              max={100}
            />
          </div>
          
          <div className="p-3 bg-muted rounded-md">
            <div className="flex justify-between">
              <span>Average Score:</span>
              <span className="font-medium">{averageScore}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Remarks */}
      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Add notes or comments"
        />
      </div>
      
      {/* Attachment */}
      <div className="space-y-2">
        <Label htmlFor="attachment">Attachment</Label>
        <div className="flex items-center gap-2">
          <Input
            id="attachment"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("attachment")?.click()}
            className="w-full"
          >
            <FileUp className="mr-2 h-4 w-4" />
            {attachment ? attachment.name : "Upload file"}
          </Button>
        </div>
      </div>
      
      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full bg-black hover:bg-black/80 text-white" 
        disabled={isSaving || isLoading || !kpiId || isLoadingSalesId}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Add Progress"
        )}
      </Button>
    </form>
  );
}; 