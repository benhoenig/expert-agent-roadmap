import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, PlusCircle, MoreHorizontal, Search, Trash2, RefreshCw } from "lucide-react";
import { xanoService } from "@/services/xanoService";
import { format } from "date-fns";
import { UserEditModal } from "../modals/UserEditModal";
import { UserAddModal } from "../modals/UserAddModal";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

// Define the User interface based on the API response
interface User {
  id?: number;
  user_id?: number; // Adding this as the API might use user_id instead of id
  created_at: number;
  role: string;
  nickname: string;
  full_name: string;
  user_status: string;
  profile_image: string | null;
}

export function UserDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Move the fetchUsers function outside the useEffect so it can be reused
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Use the real API endpoint
      const data = await xanoService.getAdminUsers();
      console.log("API Response data:", data);
      
      // Add an index-based ID if the API doesn't provide one
      const dataWithIds = data.map((user: User, index: number) => ({
        ...user,
        // Use existing id or user_id, or generate one based on index
        id: user.id || user.user_id || index + 1
      }));
      
      setUsers(dataWithIds);
      setFilteredUsers(dataWithIds);
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Apply filters when any filter changes
  useEffect(() => {
    let results = users;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        user => 
          user.full_name.toLowerCase().includes(term) || 
          user.nickname.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      results = results.filter(user => user.user_status === statusFilter);
    }
    
    // Apply role filter
    if (roleFilter !== "all") {
      results = results.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(results);
  }, [searchTerm, statusFilter, roleFilter, users]);
  
  // Get unique statuses and roles for filter options
  const uniqueStatuses = [...new Set(users.map(user => user.user_status))].filter(Boolean);
  const uniqueRoles = [...new Set(users.map(user => user.role))].filter(Boolean);
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy");
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Open edit modal for a user
  const handleOpenEditModal = (userId: number | undefined) => {
    console.log("Opening modal for user ID:", userId);
    if (userId) {
      setSelectedUserId(userId);
      setIsEditModalOpen(true);
    }
  };

  // Handle user update
  const handleUserUpdated = () => {
    // Refresh the user list after update
    fetchUsers();
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete.id) {
      toast.error("Cannot delete user: ID is missing");
      return;
    }

    try {
      // Call the real API endpoint
      await xanoService.deleteUser(userToDelete.id);
      
      toast.success(`User ${userToDelete.full_name} deleted successfully`);
      
      // Refresh the user list after deletion
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      
      // Close the dialog
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  // Handle add user modal
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchUsers();
    toast.success("User list refreshed");
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
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              View and manage all users in the system.
            </p>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 w-full max-w-sm items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm pl-8"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" className="border-gold-500 text-gold-500 hover:bg-gold-50">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleOpenAddModal} className="bg-gold-500 hover:bg-gold-600 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-4">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status || "unknown"}>
                    {status || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role || "unknown"}>
                    {role || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
        
        {/* User Table */}
        {!isLoading && !error && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.id || user.user_id || `user-${index}-${user.nickname}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.profile_image || ""} />
                            <AvatarFallback>{getInitials(user.full_name || "User")}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.full_name || "Unnamed User"}</div>
                            <div className="text-sm text-muted-foreground">@{user.nickname || "noname"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.role || "No Role"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(user.user_status || "")}>
                          {user.user_status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              console.log("Edit clicked for user:", user);
                              console.log("User ID:", user.id || user.user_id);
                              const userId = user.id || user.user_id;
                              if (userId) {
                                handleOpenEditModal(userId);
                              } else {
                                console.error("User ID is undefined");
                                toast.error("Cannot edit user: ID is missing");
                              }
                            }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenDeleteDialog(user)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>
      {/* Delete Confirmation Dialog */}
      {userToDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this user? This action will also delete all related data from the database and cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={userToDelete.profile_image || ""} />
                  <AvatarFallback>
                    {userToDelete.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userToDelete.full_name}</p>
                  <p className="text-sm text-muted-foreground">@{userToDelete.nickname}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* User Edit Modal */}
      <UserEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
      />
      <UserAddModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={handleUserUpdated}
      />
    </div>
  );
}
