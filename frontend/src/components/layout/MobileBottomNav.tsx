import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Dumbbell, ClipboardList, Bell, User } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', icon: Home, path: '/dashboard' },
  { title: 'Exercises', icon: Dumbbell, path: '/dashboard/exercises' },
  { title: 'Workouts', icon: ClipboardList, path: '/dashboard/workouts' },
  { title: 'Checkin', icon: Bell, path: '/dashboard/checkin' },
  { title: 'Account', icon: User, path: '/dashboard/account' },
];

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="flex items-stretch bg-black/50 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl shadow-black/60 px-1 py-1">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-1 rounded-full transition-all duration-200 ${
                active
                  ? 'text-lb-accent bg-lb-accent/10'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <item.icon className={`h-5 w-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
              <span className={`text-[9px] font-medium leading-none tracking-wide transition-colors ${active ? 'text-lb-accent' : 'text-gray-500'}`}>
                {item.title}
              </span>
              {active && (
                <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-lb-accent rounded-full opacity-70" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
