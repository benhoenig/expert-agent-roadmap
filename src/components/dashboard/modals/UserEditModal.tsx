import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { xanoService } from "@/services/xanoService";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SalesDetails {
  starting_date?: string;
  generation?: number;
  property_type?: string;
  probation_status?: string;
  probation_extended?: boolean;
  probation_remark?: string;
  current_rank?: number;
  mentor_id?: number;
}

interface MentorDetails {
  _sales_of_user?: Array<{
    user_id: number;
    _user: Array<{
      role: string;
      nickname: string;
      full_name: string;
      user_status: string;
      profile_image: string | null;
    }>;
  }>;
}

interface UserData {
  id?: number;
  created_at: number;
  username: string;
  role: string;
  nickname: string;
  full_name: string;
  user_status: string;
  email: string;
  profile_image: string | null;
  _sales_of_user?: SalesDetails[];
  _mentor_of_user?: MentorDetails[];
}

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
  onUserUpdated?: () => void;
}

export function UserEditModal({ isOpen, onClose, userId, onUserUpdated }: UserEditModalProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [newPassword, setNewPassword] = useState<string>("");
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  
  // Updated status options based on requirements
  const statusOptions = ["Active", "Warning", "Terminate", "Quit"];
  
  // Default role options - removed Admin role
  const roleOptions = ["Mentor", "Sales"];
  
  // Property type options for Sales
  const propertyTypeOptions = ["House", "Condominium", "Townhouse", "Land"];
  
  // Updated probation status options based on requirements
  const probationStatusOptions = ["Ongoing", "Passed", "Failed"];
  
  // Fetch user data when the modal opens and userId changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId && isOpen) {
        setIsLoading(true);
        try {
          // Use the real API endpoint
          const data = await xanoService.getUserForEditModal(userId);
          console.log("User data for modal:", data);
          
          // Handle array response immediately
          const userDataToUse = Array.isArray(data) ? data[0] : data;
          
          setUserData(userDataToUse);
          // Set selected role from the data
          setSelectedRole(userDataToUse?.role || "");
          
          // Set start date if user is sales and has starting_date
          if (userDataToUse?.role === "Sales" && userDataToUse?._sales_of_user && userDataToUse?._sales_of_user.length > 0) {
            const startingDate = userDataToUse._sales_of_user[0].starting_date;
            if (startingDate) {
              setStartDate(new Date(startingDate));
            }
          }
          
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          toast.error("Failed to load user data");
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [userId, isOpen]);
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (userData) {
      setUserData({
        ...userData,
        [name]: value
      });
    }
  };
  
  // Handle sales-specific field changes
  const handleSalesFieldChange = (name: string, value: any) => {
    if (userData && userData._sales_of_user && userData._sales_of_user.length > 0) {
      const updatedSalesData = { ...userData._sales_of_user[0], [name]: value };
      setUserData({
        ...userData,
        _sales_of_user: [updatedSalesData]
      });
    } else if (userData) {
      // Create new sales data if it doesn't exist
      setUserData({
        ...userData,
        _sales_of_user: [{ [name]: value }]
      });
    }
  };
  
  // Handle save
  const handleSave = async () => {
    if (!userDataObj || !userId) {
      toast.error("Cannot update user: Missing data");
      return;
    }

    setIsSaving(true);
    
    try {
      // Prepare the user data for the API - matching Xano field names exactly
      const userData = {
        // Basic info
        username: userDataObj.username,
        email: userDataObj.email,
        fullname: userDataObj.full_name, // Changed from full_name to fullname
        nickname: userDataObj.nickname,
        role: userDataObj.role, // Added role
        status: userDataObj.user_status, // Changed from user_status to status
        user_id: userId, // Ensure user_id is included
        
        // Sales-specific fields
        ...(selectedRole === "Sales" && userDataObj._sales_of_user && userDataObj._sales_of_user.length > 0 ? {
          starting_date: userDataObj._sales_of_user[0].starting_date,
          generation: userDataObj._sales_of_user[0].generation || 0,
          product_type: userDataObj._sales_of_user[0].property_type, // Changed from property_type to product_type
          rank_id: userDataObj._sales_of_user[0].current_rank || 0, // Changed from current_rank to rank_id
          probation_status: userDataObj._sales_of_user[0].probation_status,
          probation_extended: userDataObj._sales_of_user[0].probation_extended || false,
          probation_remark: userDataObj._sales_of_user[0].probation_remark || ""
        } : {
          // Default values for non-sales users
          starting_date: null,
          generation: 0,
          product_type: "",
          rank_id: 0,
          probation_status: "",
          probation_extended: false,
          probation_remark: ""
        })
      };
      
      console.log("Sending user data to API:", userData);
      
      // Call the API
      await xanoService.updateUserDetails(userId, userData);
      
      toast.success("User updated successfully");
      if (onUserUpdated) {
        onUserUpdated();
      }
      onClose();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle password reset
  const handlePasswordReset = async () => {
    if (!userId || !newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    setIsSettingPassword(true);
    
    try {
      // Use the dedicated password update endpoint
      await xanoService.updateUserPassword(userId, newPassword);
      
      toast.success("Password has been reset");
      setNewPassword(""); // Clear the password field
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsSettingPassword(false);
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };
  
  // Format date safely
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "Unknown";
    try {
      return format(new Date(timestamp), "PP");
    } catch (error) {
      console.error("Invalid date:", timestamp, error);
      return "Invalid date";
    }
  };
  
  // If userData is still an array at render time, use the first item
  const userDataObj = userData && Array.isArray(userData) ? userData[0] : userData;
  
  // Render loading state
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        {userDataObj && (
          <div className="space-y-6 py-2">
            {/* User Avatar and Basic Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={userDataObj?.profile_image || ""} />
                <AvatarFallback className="text-lg">
                  {getUserInitials(userDataObj?.full_name || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{userDataObj?.full_name || "User"}</h3>
                <p className="text-sm text-muted-foreground">
                  Created: {formatDate(userDataObj?.created_at)}
                </p>
              </div>
            </div>
            
            {/* Common Fields */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsHeader>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  {selectedRole === "Sales" && (
                    <TabsTrigger value="sales">Sales Details</TabsTrigger>
                  )}
                  {selectedRole === "Mentor" && (
                    <TabsTrigger value="mentor">Mentor Details</TabsTrigger>
                  )}
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </TabsHeader>
              
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={userDataObj?.username || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={userDataObj.email || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={userDataObj.full_name || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      name="nickname"
                      value={userDataObj.nickname || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {selectedRole}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={userDataObj?.user_status || ""}
                      onValueChange={(value) => {
                        if (userDataObj) {
                          setUserData({
                            ...userDataObj,
                            user_status: value
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
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
                                handleSalesFieldChange("starting_date", format(date, "yyyy-MM-dd"));
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
                        value={userDataObj._sales_of_user?.[0]?.generation || ""}
                        onChange={(e) => handleSalesFieldChange("generation", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property_type">Property Type</Label>
                      <Select
                        value={userDataObj._sales_of_user?.[0]?.property_type || ""}
                        onValueChange={(value) => handleSalesFieldChange("property_type", value)}
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="current_rank">Current Rank</Label>
                      <Input
                        id="current_rank"
                        name="current_rank"
                        type="number"
                        value={userDataObj._sales_of_user?.[0]?.current_rank || ""}
                        onChange={(e) => handleSalesFieldChange("current_rank", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="probation_status">Probation Status</Label>
                    <Select
                      value={userDataObj._sales_of_user?.[0]?.probation_status || ""}
                      onValueChange={(value) => handleSalesFieldChange("probation_status", value)}
                    >
                      <SelectTrigger id="probation_status">
                        <SelectValue placeholder="Select probation status" />
                      </SelectTrigger>
                      <SelectContent>
                        {probationStatusOptions.map(status => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="probation_extended"
                      checked={userDataObj._sales_of_user?.[0]?.probation_extended || false}
                      onCheckedChange={(checked) => handleSalesFieldChange("probation_extended", checked)}
                    />
                    <Label htmlFor="probation_extended">Probation Extended</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="probation_remark">Probation Remark</Label>
                    <Input
                      id="probation_remark"
                      name="probation_remark"
                      value={userDataObj._sales_of_user?.[0]?.probation_remark || ""}
                      onChange={(e) => handleSalesFieldChange("probation_remark", e.target.value)}
                    />
                  </div>
                </TabsContent>
              )}
              
              {/* Mentor Details Tab */}
              {selectedRole === "Mentor" && (
                <TabsContent value="mentor" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Assigned Sales Agents</Label>
                    <div className="border rounded-md p-4">
                      {userDataObj._mentor_of_user?.[0]?._sales_of_user?.length ? (
                        <div className="space-y-4">
                          {userDataObj._mentor_of_user[0]._sales_of_user.map((salesUser, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarImage src={salesUser._user[0]?.profile_image || ""} />
                                  <AvatarFallback>
                                    {getUserInitials(salesUser._user[0]?.full_name || "")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{salesUser._user[0]?.full_name}</div>
                                  <div className="text-sm text-muted-foreground">@{salesUser._user[0]?.nickname}</div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {salesUser._user[0]?.user_status}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-4">
                          No sales agents assigned
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}
              
              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset_password">Reset Password</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="reset_password"
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handlePasswordReset}
                      disabled={isSettingPassword}
                    >
                      {isSettingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Setting...
                        </>
                      ) : "Set Password"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
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