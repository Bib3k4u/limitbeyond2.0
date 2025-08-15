
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, UserCheck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import userService, { UserProfile } from '@/services/api/userService';

const AssignmentManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [trainers, setTrainers] = useState<UserProfile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [assigningMember, setAssigningMember] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedTrainers = await userService.getAllTrainers();
      const fetchedMembers = await userService.getAllMembers();
      
      setTrainers(fetchedTrainers.filter(trainer => trainer.active));
      setMembers(fetchedMembers.filter(member => member.active));
      setFilteredMembers(fetchedMembers.filter(member => member.active));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers(
        members.filter(member => 
          member.username.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.firstName.toLowerCase().includes(query) ||
          member.lastName.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, members]);

  const handleAssignTrainer = async (memberId: string, trainerId: string) => {
    setAssigningMember(memberId);
    try {
      await userService.assignTrainerToMember(memberId, trainerId);
      
      // Update local state to reflect the change
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === memberId ? { ...member, assignedTrainer: trainerId } : member
        )
      );
      setFilteredMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === memberId ? { ...member, assignedTrainer: trainerId } : member
        )
      );
      
      toast({
        title: "Trainer Assigned",
        description: "The trainer has been successfully assigned to the member.",
      });
    } catch (error) {
      console.error('Error assigning trainer:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign the trainer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAssigningMember(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trainer Assignments</h1>
          <p className="text-muted-foreground">Assign trainers to members.</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>Assign trainers to active members.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-lb-darker"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-lb-accent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Trainer</TableHead>
                  <TableHead className="text-right">Assign Trainer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="font-medium">{`${member.firstName} ${member.lastName}`}</div>
                        <div className="text-sm text-muted-foreground">{member.username}</div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {member.assignedTrainer ? (
                          <div className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                            <span>
                              {trainers.find(t => t.id === member.assignedTrainer)?.firstName || 'Assigned'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-yellow-500">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Select
                            disabled={assigningMember === member.id || trainers.length === 0}
                            onValueChange={(value) => handleAssignTrainer(member.id, value)}
                          >
                            <SelectTrigger className="w-[180px] bg-lb-darker">
                              <SelectValue placeholder="Select a trainer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Available Trainers</SelectLabel>
                                {trainers.map((trainer) => (
                                  <SelectItem key={trainer.id} value={trainer.id}>
                                    {`${trainer.firstName} ${trainer.lastName}`}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          
                          {assigningMember === member.id && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentManagement;
