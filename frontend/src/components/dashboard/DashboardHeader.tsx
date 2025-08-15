
import { useState } from 'react';
import { Bell, Menu, Search, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserProfile } from '@/services/api/userService';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/api/authService';
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  userProfile: UserProfile | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/");
  };

  return (
    <header className="bg-lb-darker/80 backdrop-blur-lg border-b border-white/5 h-16 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center">
          <SidebarTrigger>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SidebarTrigger>
          
          <div className="hidden md:flex relative ml-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 lg:w-80 pl-10 rounded-md bg-lb-card border border-white/5 focus:outline-none focus:ring-1 focus:ring-lb-accent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-lb-accent rounded-full text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-lb-darker border border-white/10" align="end">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start py-2">
                <span className="font-medium">New Feedback Response</span>
                <span className="text-sm text-muted-foreground">Your feedback has received a response from the trainer.</span>
                <span className="text-xs text-muted-foreground mt-1">2 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-2">
                <span className="font-medium">Diet Chat Update</span>
                <span className="text-sm text-muted-foreground">You have a new message in your diet chat.</span>
                <span className="text-xs text-muted-foreground mt-1">15 minutes ago</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start py-2">
                <span className="font-medium">Account Activated</span>
                <span className="text-sm text-muted-foreground">Your account has been activated by the admin.</span>
                <span className="text-xs text-muted-foreground mt-1">1 hour ago</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-lb-accent">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={userProfile?.firstName || "User"} />
                  <AvatarFallback className="bg-lb-accent text-white">
                    {userProfile?.firstName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">
                    {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : "Loading..."}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userProfile?.roles?.[0]?.toLowerCase() || "User"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-lb-darker border border-white/10" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/dashboard/account')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
