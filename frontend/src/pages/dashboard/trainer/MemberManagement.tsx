
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import userService, { UserProfile } from '@/services/api/userService';
import { useNavigate } from 'react-router-dom';

const MemberManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const profile = await userService.getCurrentUserProfile();
      setCurrentProfile(profile);
      
      // Fetch all members assigned to this trainer
      const allMembers = await userService.getAllMembers();
      
      // Filter members assigned to this trainer
      const assignedMembers = profile.assignedMembers 
        ? allMembers.filter(member => profile.assignedMembers?.includes(member.id))
        : [];
        
      setMembers(assignedMembers);
      setFilteredMembers(assignedMembers);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load your assigned members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // Handle starting diet chat with member
  const handleStartDietChat = (memberId: string) => {
    toast({
      title: "Navigation",
      description: "Navigating to diet chat (demo only).",
    });
    navigate("/dashboard/diet-chats");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Members</h1>
          <p className="text-muted-foreground">Manage your assigned members.</p>
        </div>
        <Badge className="px-4 py-1 text-lg">
          {members.length} Members
        </Badge>
      </div>

      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assigned Members</CardTitle>
            <CardDescription>View and interact with your assigned members.</CardDescription>
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
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell>{member.phoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => toast({
                              title: "View Profile",
                              description: "Viewing member profile (demo only)",
                            })}
                          >
                            <User className="h-4 w-4" />
                            Profile
                          </Button>
                          <Button 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => handleStartDietChat(member.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                            Diet Chat
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {members.length === 0 
                        ? "You have no members assigned to you yet."
                        : "No members found matching your search."}
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

export default MemberManagement;
