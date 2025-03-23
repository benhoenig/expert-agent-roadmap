import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { xanoService } from "@/services/xanoService";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface UserAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded?: () => void;
}

export function UserAddModal({ isOpen, onClose, onUserAdded }: UserAddModalProps) {
  // State for form fields
  const [selectedRole, setSelectedRole] = useState<string>("Sales"); // Default to Sales
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Basic info
    username: "",
    email: "",
    password: "",
    fullname: "",
    nickname: "",
    role: "Sales", // Default role
    status: "Active", // Default status
    
    // Sales details
    starting_date: null,
    generation: null,
    property_type: null,
    probation_status: "Ongoing",
    current_rank: 1
  });
  
  // Options for dropdowns
  const statusOptions = ["Active", "Warning", "Terminate", "Quit"];
  const roleOptions = ["Mentor", "Sales"];
  const propertyTypeOptions = ["House", "Condominium", "Townhouse", "Land"];
  
  // Handle basic field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle dropdown selection changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle switch/toggle changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Handle role change
  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    setFormData(prevData => ({
      ...prevData,
      role: value
    }));
  };
  
  // Handle form submission
  const handleSave = async () => {
    // Validate required fields
    if (!formData.username || !formData.email || !formData.password || !formData.fullname) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Email validation
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Step 1: Prepare basic user data
      const userData = {
        user_id: 0,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullname: formData.fullname,
        nickname: formData.nickname || "",
        role: selectedRole,
        status: "Active",
        starting_date: startDate ? format(startDate, "yyyy-MM-dd") : new Date().toISOString().split('T')[0],
        generation: formData.generation !== null ? parseInt(String(formData.generation)) : 0, // Default to 0 if null
        property_type: formData.property_type || "", // Default to empty string if null
        probation_status: formData.probation_status || "Ongoing",
        current_rank: formData.current_rank || 1
      };
      
      console.log("Step 1: Creating user with data:", userData);
      
      // Step 2: Create the user
      const userResponse = await xanoService.createUser(userData);
      console.log("User created successfully:", userResponse);
      
      // No need for a separate sales record creation since we included all fields in the user creation
      
      toast.success("User created successfully");
      if (onUserAdded) {
        onUserAdded();
      }
      
      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        fullname: "",
        nickname: "",
        role: "Sales",
        status: "Active",
        starting_date: null,
        generation: null,
        property_type: null,
        probation_status: "Ongoing",
        current_rank: 1
      });
      setStartDate(undefined);
      
      onClose();
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. Fill in the required fields and click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Common Fields */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                {selectedRole === "Sales" && (
                  <TabsTrigger value="sales">Sales Details</TabsTrigger>
                )}
              </TabsList>
            </TabsHeader>
            
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            {/* Sales Details Tab */}
            {selectedRole === "Sales" && (
              <TabsContent value="sales" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="starting_date">Starting Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            if (date) {
                              handleSelectChange("starting_date", format(date, "yyyy-MM-dd"));
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="generation">Generation</Label>
                    <Input
                      id="generation"
                      name="generation"
                      type="number"
                      value={formData.generation?.toString() || ""}
                      onChange={(e) => handleSelectChange("generation", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select
                    value={formData.property_type || ""}
                    onValueChange={(value) => handleSelectChange("property_type", value)}
                  >
                    <SelectTrigger id="property_type">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypeOptions.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-gold-500 hover:bg-gold-600 text-white"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for consistent tabs header styling
function TabsHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
} 