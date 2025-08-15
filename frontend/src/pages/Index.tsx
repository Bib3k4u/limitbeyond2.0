
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ParticleBackground from '@/components/ui/ParticleBackground';
import { Activity, Users, MessageSquare, ChevronRight, Dumbbell, Shield, Bell, Zap, ArrowRight, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const interactiveBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactiveBgRef.current) return;

      const bgElement = interactiveBgRef.current;
      bgElement.classList.add('active');

      const rect = bgElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const beforeElement = bgElement.querySelector(':before') as HTMLElement;
      if (beforeElement) {
        beforeElement.style.transform = `translate(${x}px, ${y}px)`;
      }

      // Reset
      setTimeout(() => {
        bgElement.classList.remove('active');
      }, 500);
    };

    const bgElement = interactiveBgRef.current;
    if (bgElement) {
      bgElement.addEventListener('mousemove', handleMouseMove as EventListener);
    }

    return () => {
      if (bgElement) {
        bgElement.removeEventListener('mousemove', handleMouseMove as EventListener);
      }
    };
  }, []);

  return (
    <div className="bg-lb-dark min-h-screen">
      <ParticleBackground />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-lb-accent/20 rounded-full filter blur-3xl opacity-20 animate-glow-pulse"></div>
          <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-lb-blue/20 rounded-full filter blur-3xl opacity-10 animate-glow-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in">
              <span className="gradient-text">LimitBeyond</span>
              <span className="block text-white mt-2">Gym Management System</span>
            </h1>
            <p className="text-xl text-lb-text-secondary mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
              A comprehensive solution for gym administrators, trainers, and members. Breaking the limits of what's possible in fitness management.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Button className="px-8 py-6 text-lg" onClick={() => navigate('/auth/signup')}>
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg" onClick={() => navigate('#features')}>
                Learn More <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Key Features</h2>
            <p className="text-lg text-lb-text-secondary max-w-2xl mx-auto">
              Discover the powerful features that make LimitBeyond the ultimate gym management solution
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Role-Based Authentication</h3>
              <p className="text-lb-text-secondary">
                Secure JWT-based authentication with specific access controls for Admin, Trainer, and Member roles.
              </p>
              <ul className="mt-4 space-y-2">
                {['JWT security', 'Role-specific access', 'Auto activation for Admins'].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Feature 2 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">User Management</h3>
              <p className="text-lb-text-secondary">
                Complete user management system with registration, profile management, and trainer assignments.
              </p>
              <ul className="mt-4 space-y-2">
                {['User registration', 'Profile management', 'Trainer-Member assignments'].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Feature 3 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Feedback System</h3>
              <p className="text-lb-text-secondary">
                Member feedback submission with trainer and admin responses and role-based visibility.
              </p>
              <ul className="mt-4 space-y-2">
                {['Member submissions', 'Trainer responses', 'Chronological ordering'].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Feature 4 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Diet Chat System</h3>
              <p className="text-lb-text-secondary">
                Real-time chat functionality between members and trainers for diet-related discussions.
              </p>
              <ul className="mt-4 space-y-2">
                {['Real-time messaging', 'Chat history', 'Role-based access'].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Feature 5 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dashboard Features</h3>
              <p className="text-lb-text-secondary">
                Role-specific dashboards with relevant information and controls for each user type.
              </p>
              <ul className="mt-4 space-y-2">
                {['Admin controls', 'Trainer management', 'Member profiles'].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Feature 6 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Modern Tech Stack</h3>
              <p className="text-lb-text-secondary">
                Built with the latest technologies for optimal performance, security, and scalability.
              </p>
              <ul className="mt-4 space-y-2">
                {['Spring Boot 3.2.3', 'MongoDB', 'JWT Security'].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/auth/signup')}>
              Start Using LimitBeyond <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-20 relative overflow-hidden" ref={interactiveBgRef}>
        <div className="interactive-bg">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <div className="relative">
                  <div className="bg-gradient-orange w-60 h-60 rounded-full absolute -top-10 -left-10 blur-3xl opacity-20"></div>
                  <div className="glass-card p-2 rounded-2xl relative z-10 glow">
                    <div className="aspect-video bg-lb-card rounded-xl flex items-center justify-center">
                      <Dumbbell className="h-20 w-20 text-lb-accent" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <h2 className="text-4xl font-bold mb-6 gradient-text">About LimitBeyond</h2>
                <p className="text-lg text-lb-text-secondary mb-6">
                  LimitBeyond was created to transform how gyms manage their operations, trainers interact with members, and how fitness enthusiasts track their progress.
                </p>
                <p className="text-lg text-lb-text-secondary mb-6">
                  Our system brings together cutting-edge technology and user-friendly interfaces to create the most comprehensive gym management solution available.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 rounded-full bg-lb-accent"></div>
                    <p className="text-lb-text-secondary">User-Centered Design</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 rounded-full bg-lb-accent"></div>
                    <p className="text-lb-text-secondary">Enterprise-Grade Security</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 rounded-full bg-lb-accent"></div>
                    <p className="text-lb-text-secondary">Real-Time Communication</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-1 w-1 rounded-full bg-lb-accent"></div>
                    <p className="text-lb-text-secondary">Role-Based Permissions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-lb-accent/10 to-transparent opacity-50"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Ready to transform your gym management?</h2>
              <p className="text-lg text-lb-text-secondary mb-8 max-w-2xl mx-auto">
                Join LimitBeyond today and experience the most comprehensive gym management solution available. Breaking limits, achieving more.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" onClick={() => navigate('/auth/signup')}>
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/#contact')}>
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Contact Us</h2>
            <p className="text-lg text-lb-text-secondary max-w-2xl mx-auto">
              Have questions or need assistance? Our team is here to help you get the most out of LimitBeyond.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 rounded-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Get In Touch</h3>
                  <p className="text-lb-text-secondary mb-6">
                    Fill out the form and our team will get back to you as soon as possible.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-lb-text-secondary">
                      <div className="bg-lb-accent/20 p-2 rounded-full">
                        <Mail className="h-5 w-5 text-lb-accent" />
                      </div>
                      <span>info@limitbeyond.com</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-lb-text-secondary">
                      <div className="bg-lb-accent/20 p-2 rounded-full">
                        <Phone className="h-5 w-5 text-lb-accent" />
                      </div>
                      <span>+1 (555) 123-4567</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-lb-text-secondary">
                      <div className="bg-lb-accent/20 p-2 rounded-full">
                        <MapPin className="h-5 w-5 text-lb-accent" />
                      </div>
                      <span>123 Fitness Lane, Workout City, WC 10001</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-lb-text-secondary block mb-2">First Name</label>
                      <input className="w-full bg-lb-darker border border-white/10 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-lb-accent" type="text" />
                    </div>
                    <div>
                      <label className="text-sm text-lb-text-secondary block mb-2">Last Name</label>
                      <input className="w-full bg-lb-darker border border-white/10 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-lb-accent" type="text" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-lb-text-secondary block mb-2">Email</label>
                    <input className="w-full bg-lb-darker border border-white/10 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-lb-accent" type="email" />
                  </div>
                  
                  <div>
                    <label className="text-sm text-lb-text-secondary block mb-2">Message</label>
                    <textarea className="w-full bg-lb-darker border border-white/10 rounded-md p-3 h-32 focus:outline-none focus:ring-1 focus:ring-lb-accent"></textarea>
                  </div>
                  
                  <Button className="w-full">Send Message</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
