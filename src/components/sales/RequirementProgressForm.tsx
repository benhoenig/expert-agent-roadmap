import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2, FileUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { xanoService } from "@/services/xanoService";
import { toast } from "sonner";

interface RequirementProgressFormProps {
  metadata: any;
  isLoading: boolean;
  onSuccess: () => void;
}

export const RequirementProgressForm = ({ metadata, isLoading, onSuccess }: RequirementProgressFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekNumber, setWeekNumber] = useState<string>("1");
  const [requirementId, setRequirementId] = useState<string>("");
  const [trainingName, setTrainingName] = useState<string>("");
  const [lessonName, setLessonName] = useState<string>("");
  const [seniorName, setSeniorName] = useState<string>("");
  const [caseType, setCaseType] = useState<string>("");
  const [lessonLearned, setLessonLearned] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [currentSalesId, setCurrentSalesId] = useState<number | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSalesId, setIsLoadingSalesId] = useState(false);
  
  // Create array of weeks 1-12
  const weeks = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  // Case types for Real Case with Senior
  const caseTypes = ["Owner Visit", "Survey", "Showing"];
  
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
  
  // Reset form fields when requirement changes
  useEffect(() => {
    setTrainingName("");
    setLessonName("");
    setSeniorName("");
    setCaseType("");
    setLessonLearned("");
  }, [requirementId]);
  
  // Get the appropriate requirement list
  const getRequirementOptions = () => {
    if (!metadata) return [];
    return metadata.salesInterface_requirement_masterData || [];
  };
  
  // Get requirement type based on ID
  const getRequirementType = () => {
    if (!requirementId) return null;
    
    const id = parseInt(requirementId);
    
    if (id === 1) return "Training Attended";
    if (id === 2) return "HOME Academy Video Watched";
    if (id === 3) return "Real Case with Senior";
    
    return null;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requirementId) {
      toast.error("Please select a requirement");
      return;
    }
    
    if (!currentSalesId) {
      toast.error("Sales ID not found. Please refresh the page.");
      return;
    }
    
    const requirementType = getRequirementType();
    
    try {
      setIsSaving(true);
      
      // Common payload properties
      const payload: any = {
        sales_id: currentSalesId,
        week_number: parseInt(weekNumber),
        requirement_id: parseInt(requirementId),
        date_added: formattedDate,
        lesson_learned: lessonLearned || null,
        count: 1, // Default count
        remark: null,
        attachment: null, // TODO: Implement file upload
        training_name: null,
        lesson_name: null,
        senior_name: null,
        case_type: null
      };
      
      // Add type-specific fields
      switch (requirementType) {
        case "Training Attended":
          if (!trainingName) {
            toast.error("Please enter a training name");
            setIsSaving(false);
            return;
          }
          payload.training_name = trainingName;
          break;
          
        case "HOME Academy Video Watched":
          if (!lessonName) {
            toast.error("Please enter a lesson name");
            setIsSaving(false);
            return;
          }
          payload.lesson_name = lessonName;
          break;
          
        case "Real Case with Senior":
          if (!seniorName) {
            toast.error("Please enter a senior name");
            setIsSaving(false);
            return;
          }
          if (!caseType) {
            toast.error("Please select a case type");
            setIsSaving(false);
            return;
          }
          payload.senior_name = seniorName;
          payload.case_type = caseType;
          break;
      }
      
      await xanoService.addRequirementProgress(payload);
      
      toast.success("Requirement progress added successfully");
      onSuccess();
      
      // Reset form
      setRequirementId("");
      setTrainingName("");
      setLessonName("");
      setSeniorName("");
      setCaseType("");
      setLessonLearned("");
      setAttachment(null);
      
    } catch (error) {
      console.error("Error adding requirement progress:", error);
      toast.error("Failed to add progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const requirementType = getRequirementType();
  
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
      
      {/* Requirement Selection */}
      <div className="space-y-2">
        <Label htmlFor="requirementType">Select Requirement</Label>
        <Select 
          value={requirementId} 
          onValueChange={setRequirementId}
          disabled={isLoading || !metadata}
        >
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Loading..." : "Select requirement"} />
          </SelectTrigger>
          <SelectContent>
            {getRequirementOptions().map((req: any, index: number) => (
              <SelectItem 
                key={index + 1} 
                value={(index + 1).toString()}
              >
                {req.requirement_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Dynamic fields based on selected requirement */}
      {requirementType === "Training Attended" && (
        <div className="space-y-2">
          <Label htmlFor="trainingName">Training Name</Label>
          <Input
            id="trainingName"
            value={trainingName}
            onChange={(e) => setTrainingName(e.target.value)}
            placeholder="Enter training name"
          />
        </div>
      )}
      
      {requirementType === "HOME Academy Video Watched" && (
        <div className="space-y-2">
          <Label htmlFor="lessonName">Lesson Name</Label>
          <Input
            id="lessonName"
            value={lessonName}
            onChange={(e) => setLessonName(e.target.value)}
            placeholder="Enter lesson name"
          />
        </div>
      )}
      
      {requirementType === "Real Case with Senior" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="seniorName">Senior Name</Label>
            <Input
              id="seniorName"
              value={seniorName}
              onChange={(e) => setSeniorName(e.target.value)}
              placeholder="Enter senior name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="caseType">Case Type</Label>
            <Select 
              value={caseType} 
              onValueChange={setCaseType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select case type" />
              </SelectTrigger>
              <SelectContent>
                {caseTypes.map((type, index) => (
                  <SelectItem key={index} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      
      {/* Lesson Learned field, shown for all requirement types */}
      {requirementType && (
        <div className="space-y-2">
          <Label htmlFor="lessonLearned">Lesson Learned</Label>
          <Textarea
            id="lessonLearned"
            value={lessonLearned}
            onChange={(e) => setLessonLearned(e.target.value)}
            placeholder="What did you learn from this experience?"
            className="min-h-[100px]"
          />
        </div>
      )}
      
      {/* Attachment */}
      {requirementType && (
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
      )}
      
      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full bg-black hover:bg-black/80 text-white" 
        disabled={isSaving || isLoading || !requirementId || isLoadingSalesId}
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