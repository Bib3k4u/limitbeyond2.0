
import { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/api/authService';
import { useToast } from '@/hooks/use-toast';

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignupSuccess = () => {
    toast({
      title: "Registration Successful",
      description: "Your account has been created. Please wait for activation."
    });
    
    // Redirect to signin with activation message
    navigate('/auth/signin', { 
      state: { fromSignup: true } 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lb-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <ParticleBackground />
      
      <div className="absolute top-0 right-20 w-72 h-72 bg-lb-accent/20 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 left-20 w-80 h-80 bg-lb-blue/20 rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-lb-text-secondary">Join LimitBeyond to reach your fitness goals</p>
        </div>
        
        <AuthForm type="signup" />
      </div>
    </div>
  );
};

export default SignUp;
