
import AuthForm from '@/components/auth/AuthForm';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SignIn = () => {
  const location = useLocation();
  const [activationMessage, setActivationMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if the user was redirected from signup
    if (location.state?.fromSignup) {
      setActivationMessage("Your account has been created! Please wait for activation before logging in.");
    }
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lb-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <ParticleBackground />
      
      <div className="absolute top-0 left-20 w-72 h-72 bg-lb-accent/20 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 right-20 w-80 h-80 bg-lb-blue/20 rounded-full filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-lb-text-secondary">Sign in to continue to LimitBeyond</p>
        </div>
        
        {activationMessage && (
          <Alert className="mb-4 bg-lb-accent/20 border-lb-accent">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{activationMessage}</AlertDescription>
          </Alert>
        )}
        
        <AuthForm type="signin" />
      </div>
    </div>
  );
};

export default SignIn;
