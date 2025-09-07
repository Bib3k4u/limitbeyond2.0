import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ParticleBackground from '@/components/ui/ParticleBackground';
import {
  Dumbbell,
  Users,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Calendar,
  BarChart2,
  HeartPulse,
  Smartphone,
  ShieldCheck,
  Award,
  Mail,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
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
              <span className="block text-white mt-2">Your Ultimate Gym Companion</span>
            </h1>
            <p className="text-xl text-lb-text-secondary mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
              Transform your fitness journey with LimitBeyond. Whether you're a gym owner, trainer, or member, we make managing workouts, tracking progress, and achieving goals effortless.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Button className="px-8 py-6 text-lg" onClick={() => navigate('/auth/signup')}>
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg" onClick={() => navigate('#features')}>
                Explore Features <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Empower Your Fitness</h2>
            <p className="text-lg text-lb-text-secondary max-w-2xl mx-auto">
              LimitBeyond is designed to help you achieve more. From tracking workouts to connecting with trainers, we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Workout Tracking */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
              <p className="text-lb-text-secondary">
                Log your workouts, monitor your progress, and celebrate your achievements. Visualize your growth with detailed charts and statistics.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  'Log exercises and sets',
                  'Track volume and personal records',
                  'Visualize progress with charts',
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 2: Personalized Training */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized Training Plans</h3>
              <p className="text-lb-text-secondary">
                Get customized workout plans tailored to your goals. Trainers can assign, monitor, and adjust your plans in real-time.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  'Custom workout assignments',
                  'Real-time plan adjustments',
                  'Goal-specific training',
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 3: Connect with Trainers */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Connect with Trainers</h3>
              <p className="text-lb-text-secondary">
                Communicate directly with your trainer. Get feedback, ask questions, and stay motivated with personalized guidance.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  'Direct messaging with trainers',
                  'Feedback and progress reviews',
                  'Motivational support',
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 4: Diet and Nutrition */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Diet and Nutrition Guidance</h3>
              <p className="text-lb-text-secondary">
                Receive expert diet advice and nutrition plans. Chat with your trainer about meal plans, supplements, and healthy habits.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  'Personalized diet plans',
                  'Real-time nutrition chat',
                  'Meal and supplement tracking',
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 5: Schedule and Reminders */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Schedule and Reminders</h3>
              <p className="text-lb-text-secondary">
                Never miss a workout. Schedule your sessions and receive reminders to keep you on track.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  'Workout scheduling',
                  'Automated reminders',
                  'Session history',
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-lb-accent mr-2" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Feature 6: Mobile Accessibility */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Access Anywhere</h3>
              <p className="text-lb-text-secondary">
                Use LimitBeyond on the go. Our mobile-friendly platform ensures you can manage your fitness anytime, anywhere.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  'Mobile and desktop access',
                  'Sync across devices',
                  'Offline mode for workouts',
                ].map((item, i) => (
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
              Join LimitBeyond Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 relative overflow-hidden" ref={interactiveBgRef}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Why Choose LimitBeyond?</h2>
            <p className="text-lg text-lb-text-secondary max-w-2xl mx-auto">
              LimitBeyond is more than just a gym management system. It's your partner in achieving fitness success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Advantage 1 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure and Private</h3>
              <p className="text-lb-text-secondary">
                Your data is protected with enterprise-grade security. Focus on your fitness without worrying about privacy.
              </p>
            </div>

            {/* Advantage 2 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Results-Driven</h3>
              <p className="text-lb-text-secondary">
                Designed to help you achieve real results. Track your progress, stay motivated, and reach your goals faster.
              </p>
            </div>

            {/* Advantage 3 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Save Time</h3>
              <p className="text-lb-text-secondary">
                Streamline your fitness management. Spend less time organizing and more time achieving your goals.
              </p>
            </div>

            {/* Advantage 4 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Support</h3>
              <p className="text-lb-text-secondary">
                Get support from fitness experts. Our team and trainers are here to guide you every step of the way.
              </p>
            </div>

            {/* Advantage 5 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Comprehensive Solution</h3>
              <p className="text-lb-text-secondary">
                Everything you need in one place. From workouts to nutrition, we provide a complete fitness solution.
              </p>
            </div>

            {/* Advantage 6 */}
            <div className="glass-card p-6 rounded-xl transition-all hover:translate-y-[-5px] hover:shadow-lg">
              <div className="bg-gradient-orange p-3 rounded-lg inline-flex mb-4 glow-sm">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community and Connection</h3>
              <p className="text-lb-text-secondary">
                Connect with a community of like-minded individuals. Share your progress, get inspired, and stay motivated.
              </p>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Ready to Break Your Limits?</h2>
              <p className="text-lg text-lb-text-secondary mb-8 max-w-2xl mx-auto">
                Join LimitBeyond today and take the first step towards a stronger, healthier you. Your fitness journey starts here.
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
            <h2 className="text-4xl font-bold mb-4 gradient-text">Get In Touch</h2>
            <p className="text-lg text-lb-text-secondary max-w-2xl mx-auto">
              Have questions or need assistance? Our team is here to help you get the most out of LimitBeyond.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 rounded-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Contact Us</h3>
                  <p className="text-lb-text-secondary mb-6">
                    Reach out to us for support, inquiries, or feedback. We're here to help!
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-lb-text-secondary">
                      <div className="bg-lb-accent/20 p-2 rounded-full">
                        <Mail className="h-5 w-5 text-lb-accent" />
                      </div>
                      <span>support@limitbeyond.com</span>
                    </div>

                    <div className="flex items-center space-x-3 text-lb-text-secondary">
                      <div className="bg-lb-accent/20 p-2 rounded-full">
                        <Phone className="h-5 w-5 text-lb-accent" />
                      </div>
                      <span>+91-8088620079</span>
                    </div>

                    <div className="flex items-center space-x-3 text-lb-text-secondary">
                      <div className="bg-lb-accent/20 p-2 rounded-full">
                        <MapPin className="h-5 w-5 text-lb-accent" />
                      </div>
                      <span>I-31, LaxmiNagar, Lalita Park, Delhi, 110092</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-lb-text-secondary block mb-2">First Name</label>
                      <input className="w-full bg-lb-darker border border-white/10 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-lb-accent" type="text" placeholder="John" />
                    </div>
                    <div>
                      <label className="text-sm text-lb-text-secondary block mb-2">Last Name</label>
                      <input className="w-full bg-lb-darker border border-white/10 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-lb-accent" type="text" placeholder="Doe" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-lb-text-secondary block mb-2">Email</label>
                    <input className="w-full bg-lb-darker border border-white/10 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-lb-accent" type="email" placeholder="john.doe@example.com" />
                  </div>

                  <div>
                    <label className="text-sm text-lb-text-secondary block mb-2">Message</label>
                    <textarea className="w-full bg-lb-darker border border-white/10 rounded-md p-3 h-32 focus:outline-none focus:ring-1 focus:ring-lb-accent" placeholder="Your message"></textarea>
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
