import React, { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Loader2 } from "lucide-react";
import { xanoService } from "@/services/xanoService";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface SalesUser {
  nickname: string;
  full_name: string;
  user_status: string;
  profile_image: string | null;
}

interface MentorItem {
  id: number;
  user_id: number;
  _mentor_of_user: [{
    full_name: string;
  }];
}

interface MentorData {
  user_id: number;
  _user: [{
    full_name: string;
  }];
}

interface SalesAssignment {
  id: number;
  generation: number;
  mentor_id: number | null;
  _sales_of_user: SalesUser[];
  _mentor: MentorData;
}

export function MentorSalesAssignment() {
  const [assignments, setAssignments] = useState<SalesAssignment[]>([]);
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSalesId, setSelectedSalesId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmUnassignVisible, setIsConfirmUnassignVisible] = useState(false);
  const [salesIdToUnassign, setSalesIdToUnassign] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await xanoService.getMentorSalesAssignments();
      console.log('Mentor sales assignments data:', data);
      setAssignments(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching sales assignments:', error);
      setError('Failed to load sales assignments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      console.log('Fetching available mentors...');
      const data = await xanoService.getMentorsList();
      console.log('Available mentors data structure:', {
        hasData: !!data,
        dataLength: Array.isArray(data) ? data.length : 'not an array',
        firstItemSample: data?.[0] ? {
          id: data[0].id,
          user_id: data[0].user_id,
          hasMentorUser: !!data[0]._mentor_of_user,
          mentorUserLength: data[0]._mentor_of_user?.length,
          mentorName: data[0]._mentor_of_user?.[0]?.full_name || 'not available'
        } : 'no first item'
      });
      setMentors(data);
    } catch (error) {
      console.error('Error fetching available mentors:', error);
      toast.error('Failed to fetch mentors list');
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

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

  const filteredAssignments = assignments.filter(assignment => {
    const salesUser = assignment._sales_of_user[0];
    if (!salesUser) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      salesUser.full_name.toLowerCase().includes(searchLower) ||
      salesUser.nickname.toLowerCase().includes(searchLower)
    );
  });

  const showMentorModal = async (salesId: number) => {
    console.log('Opening modal for sales_id:', salesId);
    setSelectedSalesId(salesId);
    await fetchMentors();
    setIsModalVisible(true);
  };

  const handleAssignMentor = async (salesId: number, mentorId: number) => {
    try {
      console.log('Assigning mentor with the following details:', { 
        salesId, 
        mentorId,
        selectedSalesAssignment: assignments.find(a => a.id === salesId),
        selectedMentor: mentors.find(m => m.id === mentorId)
      });
      
      setIsSaving(true);
      const response = await xanoService.assignMentorToSales(salesId, mentorId);
      console.log('Mentor assignment response:', response);
      
      if (response && response.id) {
        toast.success('Mentor assigned successfully');
        setIsModalVisible(false);
        await fetchAssignments(); // Refresh assignments after successful assignment
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Failed to assign mentor:', error);
      toast.error('Failed to assign mentor. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmUnassignMentor = (salesId: number) => {
    setSalesIdToUnassign(salesId);
    setIsConfirmUnassignVisible(true);
  };

  const handleUnassignMentor = async () => {
    if (!salesIdToUnassign) return;
    
    try {
      console.log('Unassigning mentor for sales ID:', salesIdToUnassign);
      await xanoService.unassignMentor(salesIdToUnassign);
      toast.success('Mentor unassigned successfully');
      setIsConfirmUnassignVisible(false);
      await fetchAssignments(); // Refresh assignments after unassign
    } catch (error) {
      console.error('Failed to unassign mentor:', error);
      toast.error('Failed to unassign mentor. Please try again.');
    }
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
            <h1 className="text-3xl font-bold tracking-tight">Mentor Sales Assignment</h1>
            <p className="text-muted-foreground">
              Assign mentors to sales agents and manage their relationships.
            </p>
          </div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 w-full max-w-sm items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sales agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm pl-8"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={fetchAssignments} 
                variant="primary-outline" 
                className="mr-2"
              >
                <RefreshCw size={16} />
                Refresh
              </Button>
            </div>
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

        {/* Sales Table */}
        {!isLoading && !error && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Generation</TableHead>
                  <TableHead>Sales Agent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Mentor</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      No sales agents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const salesUser = assignment._sales_of_user[0];
                    if (!salesUser) return null;
                    
                    return (
                      <TableRow key={salesUser.nickname}>
                        <TableCell>{assignment.generation}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={salesUser.profile_image || ""} />
                              <AvatarFallback>{getInitials(salesUser.full_name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{salesUser.full_name}</div>
                              <div className="text-sm text-muted-foreground">@{salesUser.nickname}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(salesUser.user_status)}>
                            {salesUser.user_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment._mentor?._user[0]?.full_name ? (
                            <div className="font-medium text-gold-600">
                              {assignment._mentor._user[0].full_name}
                            </div>
                          ) : (
                            <div className="text-muted-foreground italic">
                              No mentor assigned
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => showMentorModal(assignment.id)}
                              variant="primary"
                              disabled={isSaving}
                            >
                              {isSaving ? <Loader2 className="animate-spin" /> : 'Change Mentor'}
                            </Button>
                            {assignment._mentor?._user[0] && (
                              <Button
                                onClick={() => confirmUnassignMentor(assignment.id)}
                                variant="outline"
                                className="border-red-500 text-red-500 hover:bg-red-50"
                              >
                                Unassign
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Mentor Assignment Modal */}
      <Dialog open={isModalVisible} onOpenChange={setIsModalVisible}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Mentor</DialogTitle>
            <DialogDescription>
              Select a mentor to assign to this sales agent.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              onValueChange={(value) => {
                if (selectedSalesId) {
                  handleAssignMentor(selectedSalesId, parseInt(value));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a mentor" />
              </SelectTrigger>
              <SelectContent>
                {mentors?.map((mentor) => (
                  <SelectItem key={mentor.id} value={mentor.id.toString()}>
                    {mentor._mentor_of_user[0]?.full_name || 'Unknown Mentor'} (ID: {mentor.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unassign Confirmation Dialog */}
      <Dialog open={isConfirmUnassignVisible} onOpenChange={setIsConfirmUnassignVisible}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Unassign</DialogTitle>
            <DialogDescription>
              Are you sure you want to unassign the mentor from this sales agent?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmUnassignVisible(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnassignMentor}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Unassign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 