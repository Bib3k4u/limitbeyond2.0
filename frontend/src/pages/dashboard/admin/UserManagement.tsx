import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, UserCheck, UserX, MessageSquare, Settings, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import userService, { UserProfile } from '@/services/api/userService';
import feedbackService from '@/services/api/feedbackService';

const UserManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const trainers = await userService.getAllTrainers();
      const members = await userService.getAllMembers();
      const allUsers = [...trainers, ...members];
      setUsers(allUsers);
      setFilteredUsers(allUsers);
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
    let filtered = users;
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        (user.roles[0] && user.roles[0].toLowerCase().includes(query))
      );
    }
    
    // Filter by tab
    if (selectedTab !== 'all') {
      filtered = filtered.filter(user => {
        if (selectedTab === 'active') return user.active;
        if (selectedTab === 'inactive') return !user.active;
        return user.roles[0].toLowerCase() === selectedTab.toLowerCase();
      });
    }
    
    setFilteredUsers(filtered);
  }, [searchQuery, users, selectedTab]);

  const handleActivateUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await userService.activateUser(userId);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, active: true } : user
        )
      );
      toast({
        title: "User Activated",
        description: "The user has been successfully activated.",
      });
    } catch (error) {
      toast({
        title: "Activation Failed",
        description: "Failed to activate the user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await userService.deactivateUser(userId);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, active: false } : user
        )
      );
      toast({
        title: "User Deactivated",
        description: "The user has been successfully deactivated.",
      });
    } catch (error) {
      toast({
        title: "Deactivation Failed",
        description: "Failed to deactivate the user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProfile = (user: UserProfile) => {
    setSelectedUser(user);
    setShowProfileDialog(true);
  };

  const handleViewFeedback = (userId: string) => {
    navigate(`/dashboard/feedbacks?userId=${userId}`);
  };

  const getBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'TRAINER':
        return 'secondary';
      case 'MEMBER':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions.</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage all users in the system.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-lb-darker"
                />
              </div>
            </div>
          </div>
          <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 bg-lb-darker">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="admin">Admins</TabsTrigger>
              <TabsTrigger value="trainer">Trainers</TabsTrigger>
              <TabsTrigger value="member">Members</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-lb-accent" />
            </div>
          ) : (
            <div className="rounded-md border border-lb-accent/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium cursor-pointer hover:text-lb-accent"
                               onClick={() => handleViewProfile(user)}>
                            {`${user.firstName} ${user.lastName}`}
                          </div>
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getBadgeVariant(user.roles[0])}>
                            {user.roles[0]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`h-2 w-2 rounded-full mr-2 ${user.active ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span>{user.active ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-lb-darker border border-lb-accent/10">
                              <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="flex gap-2 cursor-pointer"
                                onClick={() => handleViewProfile(user)}
                              >
                                <User className="h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                className="flex gap-2 cursor-pointer"
                                onClick={() => handleViewFeedback(user.id)}
                              >
                                <MessageSquare className="h-4 w-4" />
                                View Feedback
                              </DropdownMenuItem>

                              {user.active ? (
                                <DropdownMenuItem
                                  className="flex gap-2 cursor-pointer text-red-500"
                                  disabled={actionLoading === user.id}
                                  onClick={() => handleDeactivateUser(user.id)}
                                >
                                  {actionLoading === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserX className="h-4 w-4" />
                                  )}
                                  Deactivate User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  className="flex gap-2 cursor-pointer text-green-500"
                                  disabled={actionLoading === user.id}
                                  onClick={() => handleActivateUser(user.id)}
                                >
                                  {actionLoading === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                  Activate User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="bg-lb-darker border border-lb-accent/10">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Detailed information about the user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <p className="text-lg">{selectedUser.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <p className="text-lg">{selectedUser.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <p className="text-lg">{selectedUser.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-lg">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-lg">{selectedUser.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <p className="text-lg">
                    <Badge variant={getBadgeVariant(selectedUser.roles[0])}>
                      {selectedUser.roles[0]}
                    </Badge>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => handleViewFeedback(selectedUser.id)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Feedback
                </Button>
                <Button onClick={() => navigate(`/dashboard/workouts?memberId=${selectedUser.id}`)}>
                  View Workouts
                </Button>
                {selectedUser.roles.includes('MEMBER') && (
                  <Button onClick={() => navigate(`/dashboard/diet-chats?userId=${selectedUser.id}`)}>
                    View Diet Chats
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
