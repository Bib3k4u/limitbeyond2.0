import { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import userService, { UserProfile } from '@/services/api/userService';
import authService from '@/services/api/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Exercises from '@/pages/dashboard/Exercises';
import WorkoutDetail from '@/pages/dashboard/workouts/WorkoutDetail';
import Workouts from '@/pages/dashboard/workouts';

// Import all dashboard pages
import UserManagement from '@/pages/dashboard/admin/UserManagement';
import AssignmentManagement from '@/pages/dashboard/admin/AssignmentManagement';
import MemberManagement from '@/pages/dashboard/trainer/MemberManagement';
import Feedbacks from '@/pages/dashboard/Feedbacks';
import DietChats from '@/pages/dashboard/DietChats';
import AccountSettings from '@/pages/dashboard/AccountSettings';
import HelpCenter from '@/pages/dashboard/HelpCenter';
import AdminProfile from '@/pages/dashboard/admin/AdminProfile';
import AdminPayments from '@/pages/admin/AdminPayments';
import CheckinPage from '@/pages/checkin/CheckinPage';
import AdminCheckins from '@/pages/admin/AdminCheckins';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await userService.getCurrentUserProfile();
      setUserProfile(profile);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      const errorMessage = error?.message || 'Failed to fetch user profile';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      
      // If unauthorized, redirect to login
      if (error?.status === 401 || !authService.isLoggedIn()) {
        navigate('/auth/signin');
      }
    }
  };
  
  useEffect(() => {
    if (authService.isLoggedIn()) {
      fetchUserProfile();
    } else {
      navigate('/auth/signin');
    }
  }, []);
  
  if (!authService.isLoggedIn()) {
    return <Navigate to="/auth/signin" />;
  }
  
  const handleRefresh = () => {
    fetchUserProfile();
    toast({
      title: "Refreshing",
      description: "Attempting to reload your profile data...",
    });
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error Loading Dashboard</h1>
        <p className="text-lg text-gray-300">{error}</p>
        <div className="flex space-x-4">
          <Button onClick={handleRefresh}>
            Refresh Data
          </Button>
          <Button variant="outline" onClick={() => navigate('/auth/signin')}>
            Sign In Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-lb-dark">
        <DashboardSidebar userProfile={userProfile} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader userProfile={userProfile} />
          
          <main className="flex-1 p-6 overflow-auto">
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((_, i) => (
                    <Skeleton key={i} className="h-[180px] rounded-lg" />
                  ))}
                </div>
                <Skeleton className="h-[300px] rounded-lg" />
              </div>
            ) : (
              <Routes>
                <Route index element={<DashboardHome userProfile={userProfile} />} />
                <Route path="account" element={<AccountSettings userProfile={userProfile} />} />
                <Route path="help" element={<HelpCenter />} />
                {/* Exercise routes */}
                <Route path="exercises/*" element={<Exercises />} />
                {/* Workout routes */}
                <Route path="workouts/*" element={<Workouts />} />
                {/* Role-specific routes */}
                {userProfile?.roles.includes('ADMIN') && (
                  <>
                    <Route path="users" element={<UserManagement />} />
                    <Route path="assignments" element={<AssignmentManagement />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="checkins" element={<AdminCheckins />} />
                    <Route path="checkin" element={<CheckinPage />} />
                  </>
                )}

                {/* Public checkin route for members/trainers */}
                <Route path="checkin/:userId" element={<CheckinPage />} />
                <Route path="checkin" element={<CheckinPage />} />
                
                {userProfile?.roles.includes('TRAINER') && (
                  <Route path="members" element={<MemberManagement />} />
                )}
                
                {/* Communication routes */}
                <Route path="feedbacks" element={<Feedbacks userProfile={userProfile} />} />
                <Route path="feedback" element={<Feedbacks userProfile={userProfile} />} />
                <Route path="diet-chats" element={<DietChats userProfile={userProfile} />} />
                <Route path="diet-chat" element={<DietChats userProfile={userProfile} />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Dashboard Home Component
const DashboardHome = ({ userProfile }: { userProfile: UserProfile | null }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {userProfile?.firstName}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your account today.</p>
        </div>
        <div className="bg-lb-card rounded-full px-4 py-1 text-sm text-lb-accent-secondary border border-lb-accent/20">
          {userProfile?.roles?.[0] || 'Member'}
        </div>
      </div>

      <DashboardOverview userProfile={userProfile} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent actions and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-lb-card/60 rounded-md">
                <div className="flex items-center space-x-3">
                  <div className="bg-lb-accent/20 p-2 rounded-full">
                    <div className="h-3 w-3 rounded-full bg-lb-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {i === 0 ? 'Profile updated' : i === 1 ? 'Created feedback' : 'Diet chat message sent'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {i === 0 ? '2 hours ago' : i === 1 ? 'Yesterday' : '3 days ago'}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-lb-accent-secondary underline cursor-pointer">
                  View
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Communication Status</CardTitle>
            <CardDescription>Recent feedback and diet chat activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Feedback Responses</p>
                <p className="text-sm text-lb-accent">2/3</p>
              </div>
              <div className="w-full bg-lb-darker rounded-full h-2">
                <div className="bg-gradient-orange h-2 rounded-full" style={{ width: '66%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Diet Chat Messages</p>
                <p className="text-sm text-lb-accent">5/5</p>
              </div>
              <div className="w-full bg-lb-darker rounded-full h-2">
                <div className="bg-gradient-orange h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Recent Communications</p>
              </div>
              {[1, 2].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-lb-card/60 rounded-md mt-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {i === 0 ? 'New diet chat response' : 'Feedback addressed'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i === 0 ? '5 hours ago' : '2 days ago'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
