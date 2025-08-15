import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import userService, { UserProfile } from '@/services/api/userService';

interface AccountSettingsProps {
  userProfile: UserProfile | null;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    email: userProfile?.email || '',
    phoneNumber: userProfile?.phoneNumber || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    try {
      await userService.updateProfile(userProfile.id, formData);
      toast({
        title: "Profile updated",
        description: "Your account information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 glass-card">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-lb-darker"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-lb-darker"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-lb-darker"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phoneNumber">Phone number</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="bg-lb-darker"
                  />
                </div>
              </div>
              
              <Button type="submit" className="mt-6" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Username</p>
              <p className="text-sm text-muted-foreground">{userProfile?.username}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Role</p>
              <p className="text-sm text-muted-foreground">
                {userProfile?.roles?.[0] || 'Member'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Account Status</p>
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${userProfile?.active ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-sm text-muted-foreground">
                  {userProfile?.active ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            
            {userProfile?.roles?.includes('MEMBER') && userProfile?.assignedTrainer && (
              <div>
                <p className="text-sm font-medium">Assigned Trainer</p>
                <p className="text-sm text-muted-foreground">{userProfile.assignedTrainer}</p>
              </div>
            )}
            
            {userProfile?.roles?.includes('TRAINER') && userProfile?.assignedMembers && (
              <div>
                <p className="text-sm font-medium">Assigned Members</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.assignedMembers.length} members
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Change Password</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettings;
