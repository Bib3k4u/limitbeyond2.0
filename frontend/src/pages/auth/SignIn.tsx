import AuthForm from '@/components/auth/AuthForm';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { AlertCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SignIn = () => {
  const location = useLocation();
  const [activationMessage, setActivationMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if the user was redirected from signup
    if (location.state?.fromSignup) {
      setActivationMessage(
        "Your account has been created! Members can login and start using it. Note: If you have registered as ADMIN/TRAINER. Please wait for activation before logging in."
      );
    }
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lb-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <ParticleBackground />

      {/* Floating background accents */}
      <div className="absolute top-0 left-20 w-72 h-72 bg-lb-accent/20 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-0 right-20 w-80 h-80 bg-lb-blue/20 rounded-full filter blur-3xl opacity-10 animate-float"
        style={{ animationDelay: '2s' }}
      ></div>

      <div className="z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-lb-text-secondary">
            Sign in to continue to LimitBeyond
          </p>
        </div>

        {/* Fancy Activation Message */}
        {activationMessage && (
          <div className="relative mb-6">
            <div className="animate-fadeInUp flex items-start gap-3 rounded-2xl border border-lb-accent/40 bg-gradient-to-r from-lb-accent/20 via-lb-accent/10 to-transparent p-4 shadow-lg backdrop-blur-sm relative">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="h-6 w-6 text-lb-accent drop-shadow-glow" />
              </div>
              <div className="pr-6">
                <h4 className="font-semibold text-lb-accent text-lg">
                  Account Created 🎉
                </h4>
                <p className="text-sm text-white/90 leading-relaxed">
                  {activationMessage}
                </p>
              </div>
              {/* Dismiss button */}
              <button
                onClick={() => setActivationMessage(null)}
                className="absolute top-3 right-3 text-white/70 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <AuthForm type="signin" />
      </div>
    </div>
  );
};

export default SignIn;
