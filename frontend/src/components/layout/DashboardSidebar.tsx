import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Activity, Users, User, MessageSquare, Calendar, Settings, Home, LogOut, HelpCircle, Bell, Shield, UserCog, ClipboardList, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/services/api/userService';
import authService from '@/services/api/authService';

interface DashboardSidebarProps {
  userProfile: UserProfile | null;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile && userProfile.roles && userProfile.roles.length > 0) {
      setUserRole(userProfile.roles[0]);
    }
  }, [userProfile]);

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Common menu items for all roles
  const commonItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      isActive: isActive('/dashboard'),
    },
    {
      title: 'Exercises',
      icon: Dumbbell,
      path: '/dashboard/exercises',
      isActive: isActive('/dashboard/exercises'),
    },
    {
      title: 'Workouts',
      icon: ClipboardList,
      path: '/dashboard/workouts',
      isActive: isActive('/dashboard/workouts'),
    },
    {
      title: 'Checkin',
      icon: Bell,
      path: '/dashboard/checkin',
      isActive: isActive('/dashboard/checkin'),
    },
    {
      title: 'Account',
      icon: User,
      path: '/dashboard/account',
      isActive: isActive('/dashboard/account'),
    },
    {
      title: 'Help',
      icon: HelpCircle,
      path: '/dashboard/help',
      isActive: isActive('/dashboard/help'),
    },
  ];

  // Quick checkin button visible to members and trainers
  const quickCheckin = () => {
    navigate('/dashboard/checkin');
  };

  // Admin specific menu items
  const adminItems = [
    {
      title: 'Admin Profile',
      icon: Shield,
      path: '/dashboard/profile',
      isActive: isActive('/dashboard/profile'),
    },
    {
      title: 'User Management',
      icon: Users,
      path: '/dashboard/users',
      isActive: isActive('/dashboard/users'),
    },
    {
      title: 'Assignment',
      icon: Calendar,
      path: '/dashboard/assignments',
      isActive: isActive('/dashboard/assignments'),
    },
    {
      title: 'Payments',
      icon: ClipboardList,
      path: '/dashboard/payments',
      isActive: isActive('/dashboard/payments'),
    },
    {
      title: 'Checkins',
      icon: Bell,
      path: '/dashboard/checkins',
      isActive: isActive('/dashboard/checkins'),
    },
  ];

  // Trainer specific menu items
  const trainerItems = [
    {
      title: 'My Members',
      icon: Users,
      path: '/dashboard/members',
      isActive: isActive('/dashboard/members'),
    },
  ];

  // Menu items for diet chat & feedback based on role
  const dietChatPath = userRole === 'MEMBER'
    ? '/dashboard/diet-chat'
    : '/dashboard/diet-chats';

  const feedbackPath = userRole === 'MEMBER'
    ? '/dashboard/feedback'
    : '/dashboard/feedbacks';

  const communicationItems = [
    {
      title: userRole === 'MEMBER' ? 'My Diet Chat' : 'Diet Chats',
      icon: MessageSquare,
      path: dietChatPath,
      isActive: isActive(dietChatPath),
    },
    {
      title: userRole === 'MEMBER' ? 'My Feedback' : 'Feedbacks',
      icon: Bell,
      path: feedbackPath,
      isActive: isActive(feedbackPath),
    },
  ];

  return (
    <Sidebar>
      <SidebarContent className="overflow-hidden">
        <div className="px-4 py-6 flex items-center space-x-2">
          <Activity className="h-8 w-8 text-lb-accent" />
          <span className="text-xl font-bold gradient-text">LimitBeyond</span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    variant={item.isActive ? "default" : "outline"}
                    className={item.isActive ? "bg-lb-accent/10 hover:bg-lb-accent/20" : ""}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === 'ADMIN' && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      variant={item.isActive ? "default" : "outline"}
                      className={item.isActive ? "bg-lb-accent/10 hover:bg-lb-accent/20" : ""}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {userRole === 'TRAINER' && (
          <SidebarGroup>
            <SidebarGroupLabel>Trainer</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {trainerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      variant={item.isActive ? "default" : "outline"}
                      className={item.isActive ? "bg-lb-accent/10 hover:bg-lb-accent/20" : ""}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Communication</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {communicationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    variant={item.isActive ? "default" : "outline"}
                    className={item.isActive ? "bg-lb-accent/10 hover:bg-lb-accent/20" : ""}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-lb-accent/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <span>Logout</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
