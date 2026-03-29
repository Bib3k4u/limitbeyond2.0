import { useState, useEffect, useMemo } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import userService, { UserProfile } from '@/services/api/userService';
import authService from '@/services/api/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCcw, Menu, CheckCircle, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Exercises from '@/pages/dashboard/Exercises';
import WorkoutDetail from '@/pages/dashboard/workouts/WorkoutDetail';
import Workouts from '@/pages/dashboard/workouts';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);
import { format as fmtDate } from 'date-fns';

// Import all dashboard pages
import UserManagement from '@/pages/dashboard/admin/UserManagement';
import AssignmentManagement from '@/pages/dashboard/admin/AssignmentManagement';
import MemberManagement from '@/pages/dashboard/trainer/MemberManagement';
import Feedbacks from '@/pages/dashboard/Feedbacks';
import DietChats from '@/pages/dashboard/DietChats';
import AccountSettings from '@/pages/dashboard/AccountSettings';
import HelpCenter from '@/pages/dashboard/HelpCenter';
import AdminProfile from '@/pages/dashboard/admin/AdminProfile';
import AdminPayments from '@/pages/admin/AdminPayments';
import CheckinPage from '@/pages/checkin/CheckinPage';
import { checkinApi } from '@/services/api/checkinApi';
import { workoutApi } from '@/services/api/workoutApi';
import feedbackService from '@/services/api/feedbackService';
import dietChatService from '@/services/api/dietChatService';
import { format, subDays, formatDistanceToNow } from 'date-fns';
import AdminCheckins from '@/pages/admin/AdminCheckins';
import { PageBanner } from '@/components/layout/PageBanner';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profile = await userService.getCurrentUserProfile();
      setUserProfile(profile);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error);
      const errorMessage = error?.message || 'Failed to fetch user profile';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      
      // If unauthorized, redirect to login
      if (error?.status === 401 || !authService.isLoggedIn()) {
        navigate('/auth/signin');
      }
    }
  };
  
  useEffect(() => {
    if (authService.isLoggedIn()) {
      fetchUserProfile();
    } else {
      navigate('/auth/signin');
    }
  }, []);
  
  if (!authService.isLoggedIn()) {
    return <Navigate to="/auth/signin" />;
  }
  
  const handleRefresh = () => {
    fetchUserProfile();
    toast({
      title: "Refreshing",
      description: "Attempting to reload your profile data...",
    });
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error Loading Dashboard</h1>
        <p className="text-lg text-gray-300">{error}</p>
        <div className="flex space-x-4">
          <Button onClick={handleRefresh}>
            Refresh Data
          </Button>
          <Button variant="outline" onClick={() => navigate('/auth/signin')}>
            Sign In Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-lb-dark overflow-x-hidden">
        <DashboardSidebar userProfile={userProfile} />

        {/* Floating sidebar trigger - mobile only */}
        <div className="md:hidden fixed top-3 left-3 z-50">
          <SidebarTrigger className="h-10 w-10 rounded-full bg-lb-darker/90 backdrop-blur-sm border border-white/20 shadow-lg text-white" />
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <DashboardHeader userProfile={userProfile} />

          <main className="flex-1 overflow-y-auto overflow-x-hidden pt-14 px-4 pb-24 md:pt-6 md:px-6 md:pb-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((_, i) => (
                    <Skeleton key={i} className="h-[180px] rounded-lg" />
                  ))}
                </div>
                <Skeleton className="h-[300px] rounded-lg" />
              </div>
            ) : (
              <Routes>
                <Route index element={<DashboardHome userProfile={userProfile} onProfileUpdate={fetchUserProfile} />} />
                <Route path="account" element={<AccountSettings userProfile={userProfile} />} />
                <Route path="help" element={<HelpCenter />} />
                {/* Exercise routes */}
                <Route path="exercises/*" element={<Exercises />} />
                {/* Workout routes */}
                <Route path="workouts/*" element={<Workouts />} />
                {/* Role-specific routes */}
                {userProfile?.roles.includes('ADMIN') && (
                  <>
                    <Route path="users" element={<UserManagement />} />
                    <Route path="assignments" element={<AssignmentManagement />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="checkins" element={<AdminCheckins />} />
                    <Route path="checkin" element={<CheckinPage />} />
                  </>
                )}

                {/* Public checkin route for members/trainers */}
                <Route path="checkin/:userId" element={<CheckinPage />} />
                <Route path="checkin" element={<CheckinPage />} />
                
                {userProfile?.roles.includes('TRAINER') && (
                  <Route path="members" element={<MemberManagement />} />
                )}
                
                {/* Communication routes */}
                <Route path="feedbacks" element={<Feedbacks userProfile={userProfile} />} />
                <Route path="feedback" element={<Feedbacks userProfile={userProfile} />} />
                <Route path="diet-chats" element={<DietChats userProfile={userProfile} />} />
                <Route path="diet-chat" element={<DietChats userProfile={userProfile} />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
      <MobileBottomNav />
    </SidebarProvider>
  );
};

// ── BMI Card ─────────────────────────────────────────────────────────────────
function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
  if (bmi < 25)   return { label: 'Normal',      color: 'text-green-400' };
  if (bmi < 30)   return { label: 'Overweight',  color: 'text-yellow-400' };
  return           { label: 'Obese',             color: 'text-red-400' };
}

interface BMICardProps {
  userProfile: UserProfile | null;
  showForm: boolean;
  onToggleForm: () => void;
  bmiForm: { heightCm: string; weightKg: string };
  onBmiFormChange: (v: { heightCm: string; weightKg: string }) => void;
  onBmiSubmit: (e: React.FormEvent) => void;
  bmiLoading: boolean;
}

function BMICard({ userProfile, showForm, onToggleForm, bmiForm, onBmiFormChange, onBmiSubmit, bmiLoading }: BMICardProps) {
  const history = (userProfile?.weightHistory || []).slice().sort((a, b) => a.timestamp - b.timestamp);
  const heightM = (userProfile?.heightCm || 0) / 100;
  const latestW = history.length > 0 ? history[history.length - 1].weightKg : userProfile?.currentWeightKg ?? null;
  const currentBMI = heightM > 0 && latestW != null ? parseFloat((latestW / (heightM * heightM)).toFixed(1)) : null;
  const cat = currentBMI != null ? getBMICategory(currentBMI) : null;

  const labels = history.map(pt => { try { return fmtDate(new Date(pt.timestamp), 'MMM d'); } catch { return ''; } });
  const weights = history.map(pt => pt.weightKg);
  const bmis = heightM > 0 ? history.map(pt => parseFloat((pt.weightKg / (heightM * heightM)).toFixed(1))) : [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Weight (kg)',
        data: weights,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        pointRadius: weights.length > 20 ? 0 : 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        yAxisID: 'yW',
      },
      ...(bmis.length > 0 ? [{
        label: 'BMI',
        data: bmis,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        pointRadius: bmis.length > 20 ? 0 : 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        yAxisID: 'yB',
      }] : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,15,25,0.92)',
        borderColor: 'rgba(249,115,22,0.3)',
        borderWidth: 1,
        titleColor: 'white',
        bodyColor: 'rgba(255,255,255,0.7)',
        padding: 10,
      },
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      yW: {
        type: 'linear' as const, position: 'left' as const, beginAtZero: false,
        ticks: { color: 'rgba(249,115,22,0.6)', font: { size: 10 } },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      ...(bmis.length > 0 ? {
        yB: {
          type: 'linear' as const, position: 'right' as const, beginAtZero: false,
          ticks: { color: 'rgba(139,92,246,0.6)', font: { size: 10 } },
          grid: { drawOnChartArea: false },
        },
      } : {}),
    },
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base">Weight &amp; BMI</CardTitle>
            <CardDescription>Your body metrics over time</CardDescription>
          </div>
          <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 flex items-center gap-1.5" onClick={onToggleForm}>
            <Weight className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Update Weight / Height'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={onBmiSubmit} className="flex flex-wrap items-end gap-3 mb-5 p-3 bg-lb-darker/60 rounded-lg border border-white/10">
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">Height (cm)</Label>
              <Input
                type="number"
                placeholder="e.g. 175"
                value={bmiForm.heightCm}
                onChange={e => onBmiFormChange({ ...bmiForm, heightCm: e.target.value })}
                className="w-28 bg-lb-dark border-white/20 text-white h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">New Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 70.5"
                value={bmiForm.weightKg}
                onChange={e => onBmiFormChange({ ...bmiForm, weightKg: e.target.value })}
                className="w-28 bg-lb-dark border-white/20 text-white h-8 text-sm"
              />
            </div>
            <Button type="submit" size="sm" disabled={bmiLoading || (!bmiForm.heightCm && !bmiForm.weightKg)} className="bg-lb-accent hover:bg-lb-accent/90">
              {bmiLoading ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Saving</> : 'Save'}
            </Button>
          </form>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          {latestW != null && (
            <div className="bg-lb-darker/60 rounded-lg px-4 py-2.5 text-center">
              <p className="text-base font-bold text-orange-400">{latestW} kg</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Weight</p>
            </div>
          )}
          {currentBMI != null && cat && (
            <div className="bg-lb-darker/60 rounded-lg px-4 py-2.5 text-center">
              <p className={`text-base font-bold ${cat.color}`}>{currentBMI}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">BMI · {cat.label}</p>
            </div>
          )}
          {userProfile?.heightCm && (
            <div className="bg-lb-darker/60 rounded-lg px-4 py-2.5 text-center">
              <p className="text-base font-bold text-white">{userProfile.heightCm} cm</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Height</p>
            </div>
          )}
          {history.length > 0 && (
            <div className="bg-lb-darker/60 rounded-lg px-4 py-2.5 text-center">
              <p className="text-base font-bold text-white">{history.length}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Data Points</p>
            </div>
          )}
        </div>

        {history.length > 1 ? (
          <>
            <div className="flex items-center gap-5 mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-6 h-[3px] rounded-full bg-orange-500" />
                <span className="text-xs text-gray-400">Weight (kg)</span>
              </div>
              {bmis.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-[3px] rounded-full bg-violet-500" />
                  <span className="text-xs text-gray-400">BMI</span>
                </div>
              )}
            </div>
            <div className="h-[200px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 py-4 text-center">
            {latestW != null
              ? 'Log more weight updates to see your trend chart.'
              : 'No weight data yet — click "Update Weight / Height" to get started.'}
          </p>
        )}

        {currentBMI != null && (
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { range: '< 18.5', label: 'Underweight', color: 'bg-blue-900/40 border-blue-800/40' },
              { range: '18.5–24.9', label: 'Normal', color: 'bg-green-900/40 border-green-800/40' },
              { range: '25–29.9', label: 'Overweight', color: 'bg-yellow-900/40 border-yellow-800/40' },
              { range: '≥ 30', label: 'Obese', color: 'bg-red-900/40 border-red-800/40' },
            ].map(band => (
              <div key={band.label} className={`rounded-lg p-2 border ${band.color}`}>
                <p className="font-medium text-white">{band.range}</p>
                <p className="text-gray-400 mt-0.5">{band.label}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Dashboard Home Component
const DashboardHome = ({ userProfile, onProfileUpdate }: { userProfile: UserProfile | null; onProfileUpdate?: () => void }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // BMI update form state
  const [bmiForm, setBmiForm] = useState({ heightCm: String(userProfile?.heightCm || ''), weightKg: '' });
  const [bmiLoading, setBmiLoading] = useState(false);
  const [showBmiForm, setShowBmiForm] = useState(false);

  const handleBmiUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;
    setBmiLoading(true);
    try {
      const payload: any = {};
      if (bmiForm.heightCm) payload.heightCm = Number(bmiForm.heightCm);
      if (bmiForm.weightKg) payload.weightKg = Number(bmiForm.weightKg);
      await userService.updateProfile(userProfile.id, payload);
      toast({ title: 'Updated!', description: 'Weight & height saved. BMI recalculated.' });
      setShowBmiForm(false);
      setBmiForm(prev => ({ ...prev, weightKg: '' }));
      onProfileUpdate?.();
    } catch {
      toast({ title: 'Error', description: 'Could not save. Please try again.', variant: 'destructive' });
    } finally {
      setBmiLoading(false);
    }
  };
  const [checkinDone, setCheckinDone] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [dietChats, setDietChats] = useState<any[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.id) return;
    const fetchData = async () => {
      setDataLoading(true);
      const [workoutsRes, feedbacksRes, chatsRes, checkinsRes] = await Promise.allSettled([
        workoutApi.getAll(userProfile.id),
        feedbackService.getMemberFeedback(userProfile.id),
        dietChatService.getMemberDietChats(userProfile.id),
        checkinApi.recent(30, userProfile.id),
      ]);
      if (workoutsRes.status === 'fulfilled') {
        const sorted = [...(workoutsRes.value?.data || [])].sort((a: any, b: any) =>
          new Date(b.scheduledDate || b.createdAt || 0).getTime() - new Date(a.scheduledDate || a.createdAt || 0).getTime()
        );
        setRecentWorkouts(sorted);
      }
      if (feedbacksRes.status === 'fulfilled') setFeedbacks(feedbacksRes.value || []);
      if (chatsRes.status === 'fulfilled') setDietChats(chatsRes.value || []);
      if (checkinsRes.status === 'fulfilled') {
        const ci = checkinsRes.value?.data || [];
        setRecentCheckins(ci);
        const latest = [...ci].sort((a: any, b: any) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        )[0];
        if (latest && format(new Date(latest.occurredAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
          setCheckinDone(true);
        }
      }
      setDataLoading(false);
    };
    fetchData();
  }, [userProfile?.id]);

  const handleQuickCheckin = async () => {
    if (!userProfile?.id || checkinDone) return;
    setCheckinLoading(true);
    try {
      await checkinApi.addCheckin(userProfile.id);
      setCheckinDone(true);
      toast({ title: 'Checked in!', description: 'Your attendance has been recorded.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to check in. Please try again.', variant: 'destructive' });
    } finally {
      setCheckinLoading(false);
    }
  };

  // Unified activity feed
  const activityFeed = useMemo(() => {
    type ActivityEvent = { label: string; sub: string; date: Date; dotBg: string; dotRing: string; link: string };
    const events: ActivityEvent[] = [];
    recentWorkouts.forEach((w: any) => events.push({
      label: w.name || 'Workout logged',
      sub: `${(w.sets || []).length} sets · ${w.completed ? 'Completed' : 'In progress'}`,
      date: new Date(w.scheduledDate || w.createdAt || Date.now()),
      dotBg: 'bg-lb-accent',
      dotRing: 'bg-lb-accent/20',
      link: `/dashboard/workouts/${w.id}`,
    }));
    feedbacks.forEach((f: any) => events.push({
      label: f.title || 'Feedback submitted',
      sub: (f.responses?.length || 0) > 0 ? `${f.responses.length} trainer response(s)` : 'Awaiting response',
      date: new Date(f.createdAt),
      dotBg: 'bg-blue-400',
      dotRing: 'bg-blue-500/20',
      link: '/dashboard/feedbacks',
    }));
    dietChats.forEach((d: any) => events.push({
      label: d.title || 'Diet chat',
      sub: `${(d.messages?.length || 0)} messages`,
      date: new Date(d.createdAt),
      dotBg: 'bg-green-400',
      dotRing: 'bg-green-500/20',
      link: '/dashboard/diet-chats',
    }));
    return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);
  }, [recentWorkouts, feedbacks, dietChats]);

  const feedbackStats = useMemo(() => ({
    total: feedbacks.length,
    responded: feedbacks.filter((f: any) => (f.responses?.length || 0) > 0).length,
  }), [feedbacks]);

  const dietChatStats = useMemo(() => ({
    total: dietChats.length,
    totalMessages: dietChats.reduce((acc: number, d: any) => acc + (d.messages?.length || 0), 0),
  }), [dietChats]);

  const workoutStats = useMemo(() => {
    const now = new Date();
    const thisMonth = recentWorkouts.filter((w: any) => {
      try {
        const d = new Date(w.scheduledDate || w.createdAt || 0);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } catch { return false; }
    });
    return {
      total: recentWorkouts.length,
      thisMonth: thisMonth.length,
      completed: recentWorkouts.filter((w: any) => w.completed).length,
    };
  }, [recentWorkouts]);

  // Last 7 days attendance strip
  const last7Days = useMemo(() => {
    const checkedSet = new Set(
      recentCheckins.map((c: any) => { try { return format(new Date(c.occurredAt), 'yyyy-MM-dd'); } catch { return ''; } })
    );
    return Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return { date: d, checked: checkedSet.has(format(d, 'yyyy-MM-dd')), isToday: i === 6 };
    });
  }, [recentCheckins]);

  return (
    <div className="space-y-6">
      <PageBanner
        title={`Welcome back, ${userProfile?.firstName || 'Athlete'}!`}
        subtitle="Here's what's happening with your account today"
        imageUrl="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&q=80&auto=format&fit=crop"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div />
        <div className="flex items-center gap-2 flex-wrap">
          {checkinDone ? (
            <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              Checked In Today
            </div>
          ) : (
            <Button
              onClick={handleQuickCheckin}
              disabled={checkinLoading || !userProfile?.id}
              size="sm"
              className="flex items-center gap-1.5 bg-lb-accent hover:bg-lb-accent/90 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              {checkinLoading ? 'Checking in...' : 'Check In'}
            </Button>
          )}
          <div className="bg-lb-card rounded-full px-4 py-1 text-sm text-lb-accent-secondary border border-lb-accent/20">
            {userProfile?.roles?.[0] || 'Member'}
          </div>
        </div>
      </div>

      <DashboardOverview userProfile={userProfile} />

      {/* BMI Card */}
      <BMICard
        userProfile={userProfile}
        showForm={showBmiForm}
        onToggleForm={() => setShowBmiForm(v => !v)}
        bmiForm={bmiForm}
        onBmiFormChange={setBmiForm}
        onBmiSubmit={handleBmiUpdate}
        bmiLoading={bmiLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest from workouts, feedback &amp; diet chats</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-md" />)}
              </div>
            ) : activityFeed.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">No activity yet — start by logging a workout!</p>
            ) : (
              <div className="space-y-2">
                {activityFeed.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-lb-card/60 rounded-md cursor-pointer hover:bg-lb-card/80 transition-colors"
                    onClick={() => navigate(item.link)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`${item.dotRing} p-2 rounded-full shrink-0`}>
                        <div className={`h-3 w-3 rounded-full ${item.dotBg}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-500 shrink-0 ml-2 whitespace-nowrap">
                      {formatDistanceToNow(item.date, { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats & Attendance */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Stats &amp; Attendance</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Last 7-day checkin strip */}
            <div>
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Last 7 Days</p>
              <div className="flex items-end gap-2">
                {last7Days.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className={`w-full rounded-full aspect-square max-w-[32px] mx-auto transition-colors ${
                      day.checked ? 'bg-green-500' : 'bg-white/10'
                    } ${day.isToday ? 'ring-2 ring-lb-accent ring-offset-2 ring-offset-lb-dark' : ''}`} />
                    <span className="text-[9px] text-gray-500 font-medium">{format(day.date, 'EEE')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workouts this month */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-sm font-medium">Workouts This Month</p>
                <p className="text-sm text-lb-accent font-semibold">{workoutStats.thisMonth}</p>
              </div>
              <div className="w-full bg-lb-darker rounded-full h-2">
                <div
                  className="bg-gradient-orange h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (workoutStats.thisMonth / 20) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{workoutStats.completed} completed · {workoutStats.total} total all time</p>
            </div>

            {/* Feedback */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-sm font-medium">Feedback Responses</p>
                <p className="text-sm text-blue-400 font-semibold">{feedbackStats.responded}/{feedbackStats.total}</p>
              </div>
              <div className="w-full bg-lb-darker rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: feedbackStats.total > 0 ? `${(feedbackStats.responded / feedbackStats.total) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {feedbackStats.total - feedbackStats.responded > 0
                  ? `${feedbackStats.total - feedbackStats.responded} awaiting trainer reply`
                  : feedbackStats.total > 0 ? 'All feedback replied' : 'No feedback submitted yet'}
              </p>
            </div>

            {/* Diet chats */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-sm font-medium">Diet Chats</p>
                <p className="text-sm text-green-400 font-semibold">{dietChatStats.total} chat{dietChatStats.total !== 1 ? 's' : ''}</p>
              </div>
              <div className="w-full bg-lb-darker rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (dietChatStats.totalMessages / 20) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{dietChatStats.totalMessages} total messages exchanged</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
