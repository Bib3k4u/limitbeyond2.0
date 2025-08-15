
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Menu, X, LogOut, User, Dumbbell } from "lucide-react";
import authService from "@/services/api/authService";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    setIsLoggedIn(authService.isLoggedIn());
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-lb-darker/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-lb-accent" />
          <span className="text-xl font-bold gradient-text">LimitBeyond</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-lb-text hover:text-lb-accent transition-colors">
            Home
          </Link>
          <Link to="/#features" className="text-lb-text hover:text-lb-accent transition-colors">
            Features
          </Link>
          <Link to="/#about" className="text-lb-text hover:text-lb-accent transition-colors">
            About
          </Link>
          <Link to="/#contact" className="text-lb-text hover:text-lb-accent transition-colors">
            Contact
          </Link>
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth/signin")}
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/auth/signup")}
              >
                Get Started
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-lb-text" />
          ) : (
            <Menu className="h-6 w-6 text-lb-text" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-lb-dark/95 md:hidden animate-fade-in">
          <div className="flex flex-col h-full pt-20 items-center justify-center space-y-6 text-center">
            <Link
              to="/"
              className="text-xl text-lb-text hover:text-lb-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/#features"
              className="text-xl text-lb-text hover:text-lb-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/#about"
              className="text-xl text-lb-text hover:text-lb-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/#contact"
              className="text-xl text-lb-text hover:text-lb-accent transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            {isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="w-full max-w-xs"
                >
                  <User className="h-5 w-5 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full max-w-xs"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    navigate("/auth/signin");
                    setIsMenuOpen(false);
                  }}
                  className="w-full max-w-xs"
                >
                  Sign In
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    navigate("/auth/signup");
                    setIsMenuOpen(false);
                  }}
                  className="w-full max-w-xs"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
