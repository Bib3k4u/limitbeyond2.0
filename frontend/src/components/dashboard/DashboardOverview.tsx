
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, MessageSquare, Bell, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react';
import { UserProfile } from '@/services/api/userService';
import userService from '@/services/api/userService';
import { workoutApi } from '@/services/api/workoutApi';
import { format, subDays } from 'date-fns';
import { checkinApi } from '@/services/api/checkinApi';
import { WorkoutStatsChart } from './WorkoutStatsChart';
import { WorkoutNotifications } from './WorkoutNotifications';

interface DashboardOverviewProps {
  userProfile: UserProfile | null;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ userProfile }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalMembers, setTotalMembers] = useState<number | null>(null);
  const [activeTrainersCount, setActiveTrainersCount] = useState<number | null>(null);
  const [workoutsCount, setWorkoutsCount] = useState<number | null>(null);
  const [totalVolume, setTotalVolume] = useState<number | null>(null);
  const [progressPercent, setProgressPercent] = useState<number | null>(null);
  const [lastWorkout, setLastWorkout] = useState<any | null>(null);
  const [lastWorkoutVolume, setLastWorkoutVolume] = useState<number | null>(null);
  const [daysActive30, setDaysActive30] = useState<number | null>(null);
  
  useEffect(() => {
    if (userProfile && userProfile.roles && userProfile.roles.length > 0) {
      setUserRole(userProfile.roles[0]);
    }
  }, [userProfile]);

  // Compute metrics using API data
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const now = new Date();
        const endCurrent = format(now, 'yyyy-MM-dd');
        const startCurrent = format(subDays(now, 29), 'yyyy-MM-dd'); // last 30 days
        const startPrev = format(subDays(now, 59), 'yyyy-MM-dd');
        const endPrev = format(subDays(now, 30), 'yyyy-MM-dd');

        // Helper to compute volume from workouts array
        const computeVolume = (workouts: any[]) => {
          let vol = 0;
          workouts.forEach(w => {
            if (w.sets && Array.isArray(w.sets)) {
              w.sets.forEach((s: any) => {
                const weight = Number(s.weight || 0);
                const reps = Number(s.reps || 0);
                vol += weight * reps;
              });
            }
          });
          return vol;
        };

        // ADMIN: aggregate across all members
        if (userProfile.roles?.includes('ADMIN')) {
          // members
          const membersResp = await userService.getAllMembers();
          setTotalMembers(membersResp?.length ?? 0);

          // active trainers
          try {
            const trainersResp = await userService.getAllTrainers();
            setActiveTrainersCount(trainersResp?.length ?? 0);
          } catch (e) {
            setActiveTrainersCount(null);
          }

          // For members, fetch workouts per member for current and previous window
          let currentVol = 0;
          let prevVol = 0;
          let countWorkouts = 0;

          // Batch requests per member (serial to avoid overloading, but Promise.all is possible)
          await Promise.all((membersResp || []).map(async (m: any) => {
            try {
              const currResp = await workoutApi.getByDateRange(startCurrent, endCurrent);
              // Note: backend getByDateRange filters by current user; for admin we need member-specific calls
              // Instead call workoutApi.getAll with memberId and then filter by date client-side
              const allResp = await workoutApi.getAll(m.id);
              const memberWorkouts = allResp?.data || [];
              // filter
              const current = memberWorkouts.filter((w: any) => {
                const d = new Date(w.scheduledDate);
                return d >= new Date(startCurrent) && d <= new Date(endCurrent);
              });
              const prev = memberWorkouts.filter((w: any) => {
                const d = new Date(w.scheduledDate);
                return d >= new Date(startPrev) && d <= new Date(endPrev);
              });
              currentVol += computeVolume(current);
              prevVol += computeVolume(prev);
              countWorkouts += memberWorkouts.length;
            } catch (e) {
              console.error('Error fetching member workouts for dashboard', e);
            }
          }));

          setTotalVolume(Math.round(currentVol));
          setWorkoutsCount(countWorkouts);
          // progressPercent
          if (prevVol === 0) setProgressPercent(currentVol === 0 ? 0 : 100);
          else setProgressPercent(Math.round(((currentVol - prevVol) / prevVol) * 100));
        }

        // TRAINER: aggregate across assigned members
        else if (userProfile.roles?.includes('TRAINER')) {
          const assigned = userProfile.assignedMembers || [];
          setTotalMembers(assigned.length);
          setActiveTrainersCount(null);

          let currentVol = 0;
          let prevVol = 0;
          let countWorkouts = 0;
          await Promise.all((assigned || []).map(async (mid: string) => {
            try {
              const resp = await workoutApi.getAll(mid);
              const memberWorkouts = resp?.data || [];
              const current = memberWorkouts.filter((w: any) => {
                const d = new Date(w.scheduledDate);
                return d >= new Date(startCurrent) && d <= new Date(endCurrent);
              });
              const prev = memberWorkouts.filter((w: any) => {
                const d = new Date(w.scheduledDate);
                return d >= new Date(startPrev) && d <= new Date(endPrev);
              });
              currentVol += computeVolume(current);
              prevVol += computeVolume(prev);
              countWorkouts += memberWorkouts.length;
            } catch (e) {
              console.error('Error fetching trainer member workouts', e);
            }
          }));

          setTotalVolume(Math.round(currentVol));
          setWorkoutsCount(countWorkouts);
          if (prevVol === 0) setProgressPercent(currentVol === 0 ? 0 : 100);
          else setProgressPercent(Math.round(((currentVol - prevVol) / prevVol) * 100));
        }

        // MEMBER: use their own workouts
        else {
          try {
            const resp = await workoutApi.getAll();
            const myWorkouts = resp?.data || [];
            setWorkoutsCount(myWorkouts.length);
            const current = myWorkouts.filter((w: any) => {
              const d = new Date(w.scheduledDate);
              return d >= new Date(startCurrent) && d <= new Date(endCurrent);
            });
            const prev = myWorkouts.filter((w: any) => {
              const d = new Date(w.scheduledDate);
              return d >= new Date(startPrev) && d <= new Date(endPrev);
            });
            const currentVol = computeVolume(current);
            const prevVol = computeVolume(prev);
            setTotalVolume(Math.round(currentVol));
            if (prevVol === 0) setProgressPercent(currentVol === 0 ? 0 : 100);
            else setProgressPercent(Math.round(((currentVol - prevVol) / prevVol) * 100));

            // Compute last workout and its total volume
            if (myWorkouts.length > 0) {
              const sorted = myWorkouts.slice().sort((a: any, b: any) => {
                const da = new Date(a.scheduledDate || a.completedDate).getTime();
                const db = new Date(b.scheduledDate || b.completedDate).getTime();
                return db - da;
              });
              const last = sorted[0];
              setLastWorkout(last);
              let lwVol = 0;
              if (last.sets && Array.isArray(last.sets)) {
                last.sets.forEach((s: any) => {
                  const w = Number(s.weight || 0);
                  const r = Number(s.reps || 0);
                  lwVol += w * r;
                });
              }
              setLastWorkoutVolume(Math.round(lwVol));
            } else {
              setLastWorkout(null);
              setLastWorkoutVolume(null);
            }
            // compute days active in last 30 days using checkins
            try {
              const end = format(new Date(), 'yyyy-MM-dd');
              const start = format(subDays(new Date(), 29), 'yyyy-MM-dd');
              const resp = await checkinApi.between(start, end);
              const all = resp.data || [];
              const mine = all.filter((c:any) => c.userId === userProfile.id);
              const days = new Set<string>();
              mine.forEach((c:any)=>{ days.add(new Date(c.occurredAt).toISOString().split('T')[0]); });
              setDaysActive30(days.size);
            } catch (e) {
              setDaysActive30(null);
            }
          } catch (e) {
            console.error('Error fetching member workouts for dashboard', e);
          }
        }
      } catch (e) {
        console.error('Dashboard metrics error', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [userProfile]);
  
  // Build cards based on computed metrics
  const adminCards = [
    {
      title: 'Total Members',
      value: totalMembers !== null ? String(totalMembers) : '—',
      icon: Users,
      trend: progressPercent !== null ? `${progressPercent > 0 ? '+' : ''}${progressPercent}%` : '—',
      trendUp: (progressPercent || 0) >= 0,
      description: 'Member activity (30d)',
      color: 'text-green-400',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-green-500/5',
    },
    {
      title: 'Active Trainers',
      value: activeTrainersCount !== null ? String(activeTrainersCount) : '—',
      icon: Activity,
      trend: '—',
      trendUp: true,
      description: 'Trainers in system',
      color: 'text-blue-400',
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-blue-500/5',
    },
    {
      title: 'Workouts (all)',
      value: workoutsCount !== null ? String(workoutsCount) : '—',
      icon: Bell,
      trend: '—',
      trendUp: true,
      description: 'Total workouts recorded',
      color: 'text-yellow-400',
      gradientFrom: 'from-yellow-500/20',
      gradientTo: 'to-yellow-500/5',
    },
    {
      title: 'Revenue (30d)',
      value: '—',
      icon: TrendingUp,
      trend: progressPercent !== null ? `${progressPercent > 0 ? '+' : ''}${progressPercent}%` : '—',
      trendUp: (progressPercent || 0) >= 0,
      description: 'Revenue for last 30 days',
      color: 'text-purple-400',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-purple-500/5',
    },
  ];

  const trainerCards = [
    {
      title: 'Assigned Members',
      value: totalMembers !== null ? String(totalMembers) : '—',
      icon: Users,
      trend: progressPercent !== null ? `${progressPercent > 0 ? '+' : ''}${progressPercent}%` : '—',
      trendUp: (progressPercent || 0) >= 0,
      description: 'Member activity (30d)',
      color: 'text-green-400',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-green-500/5',
    },
    {
      title: 'Workouts (assigned)',
      value: workoutsCount !== null ? String(workoutsCount) : '—',
      icon: Activity,
      trend: '—',
      trendUp: true,
      description: 'Workouts for your members',
      color: 'text-blue-400',
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-blue-500/5',
    },
    {
      title: 'Total Volume (30d)',
      value: totalVolume !== null ? String(totalVolume) : '—',
      icon: TrendingUp,
      trend: progressPercent !== null ? `${progressPercent > 0 ? '+' : ''}${progressPercent}%` : '—',
      trendUp: (progressPercent || 0) >= 0,
      description: 'Kg x reps for last 30 days',
      color: 'text-purple-400',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-purple-500/5',
    },
    {
      title: 'Active Members (30d)',
      value: totalMembers !== null ? String(Math.round((totalMembers || 0) * 0.6)) : '—',
      icon: MessageSquare,
      trend: '—',
      trendUp: true,
      description: 'Estimated active fraction',
      color: 'text-yellow-400',
      gradientFrom: 'from-yellow-500/20',
      gradientTo: 'to-yellow-500/5',
    },
  ];

  const memberCards = [
    {
      title: 'Workouts (30d)',
      value: workoutsCount !== null ? String(workoutsCount) : '—',
      icon: Activity,
      trend: progressPercent !== null ? `${progressPercent > 0 ? '+' : ''}${progressPercent}%` : '—',
      trendUp: (progressPercent || 0) >= 0,
      description: 'Compare last 30d vs previous 30d',
      color: 'text-green-400',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-green-500/5',
    },
    {
      title: 'Last Workout',
      value: lastWorkout ? `${format(new Date(lastWorkout.scheduledDate || lastWorkout.completedDate), 'MMM d')}` : '—',
      icon: TrendingUp,
      trend: lastWorkoutVolume !== null ? `${lastWorkoutVolume} kg` : '—',
      trendUp: true,
      description: lastWorkout ? `${lastWorkout.name || 'Workout'} — ${lastWorkoutVolume ?? '—'} kg` : 'No workouts found',
      color: 'text-purple-400',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-purple-500/5',
    },
    {
      title: 'Profile Completeness',
      value: userProfile ? `${(userProfile.firstName && userProfile.lastName) ? '80%' : '50%'}` : '—',
      icon: MessageSquare,
      trend: '—',
      trendUp: true,
      description: 'Complete profile to get better guidance',
      color: 'text-yellow-400',
      gradientFrom: 'from-yellow-500/20',
      gradientTo: 'to-yellow-500/5',
    },
    {
      title: 'Consistency',
  value: daysActive30 !== null ? String(daysActive30) : '—',
      icon: Bell,
      trend: '—',
      trendUp: true,
      description: 'Days active in 30d',
      color: 'text-blue-400',
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-blue-500/5',
    },
  ];

  let cardsToDisplay = memberCards; // Default to member cards
  if (userRole === 'ADMIN') cardsToDisplay = adminCards;
  else if (userRole === 'TRAINER') cardsToDisplay = trainerCards;
  
  
  return (
    <div>
      {userRole === 'MEMBER' && (
        <div className="mb-6">
          <WorkoutStatsChart />
        </div>
      )}

      {/* Workout Notifications */}
      {userRole === 'MEMBER' && (
        <div className="mb-4">
          <WorkoutNotifications />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardsToDisplay.map((card, index) => (
          <Card 
            key={index}
            className="glass-card transition-all hover:translate-y-[-5px] hover:shadow-lg"
          >
            <CardHeader className={`pb-2 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} rounded-t-lg`}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold">{card.value}</p>
                <div className={`flex items-center space-x-1 ${card.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                  {card.trendUp ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{card.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;
