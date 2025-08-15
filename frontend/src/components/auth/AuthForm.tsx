import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2, LogIn, UserPlus } from 'lucide-react';
import authService, { SigninData, SignupData } from '@/services/api/authService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  type: 'signin' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SignupData>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'MEMBER'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      role: value as 'ADMIN' | 'TRAINER' | 'MEMBER' 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (type === 'signin') {
        const signinData: SigninData = {
          username: formData.username,
          password: formData.password
        };
        
        try {
          console.log("Attempting to sign in with:", signinData.username);
          const response = await authService.signin(signinData);
          console.log("Sign in response:", response);
          
          if (response.token) {
            toast({
              title: "Login Successful",
              description: response.message || "Welcome back to LimitBeyond!"
            });
            navigate('/dashboard');
          } else {
            const errorMsg = response.message || 'Login failed. Please check your credentials.';
            setError(errorMsg);
            toast({
              title: "Authentication Error",
              description: errorMsg,
              variant: "destructive"
            });
          }
        } catch (signinErr: any) {
          console.error('Signin error full details:', signinErr);
          
          // Get the error message from the server response
          const errorMessage = signinErr?.response?.data?.message || 'Authentication failed. Please try again.';
          
          setError(errorMessage);
          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive"
          });
        }
      } else {
        const response = await authService.signup(formData);
        toast({
          title: "Registration Successful",
          description: response.message || "Please wait for account activation."
        });
        navigate('/auth/signin', { state: { fromSignup: true } });
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto glass-card overflow-hidden animate-fade-in">
      <CardHeader className="space-y-1 bg-gradient-orange bg-opacity-10 text-white">
        <CardTitle className="text-2xl font-bold text-center">
          {type === 'signin' ? 'Sign In' : 'Create an Account'}
        </CardTitle>
        <CardDescription className="text-center text-gray-200">
          {type === 'signin' 
            ? 'Enter your credentials to access your account' 
            : 'Fill in the form below to create your account'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="bg-lb-darker"
            />
          </div>
          
          {type === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-lb-darker"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="bg-lb-darker"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="bg-lb-darker"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="1234567890"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="bg-lb-darker"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-lb-darker">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="TRAINER">Trainer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="bg-lb-darker"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : type === 'signin' ? (
              <LogIn className="mr-2 h-4 w-4" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            {type === 'signin' ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-white/10 pt-4">
        <div className="text-sm text-lb-text-secondary">
          {type === 'signin' ? (
            <>
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-lb-accent-secondary hover:underline">
                Sign Up
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a href="/auth/signin" className="text-lb-accent-secondary hover:underline">
                Sign In
              </a>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
