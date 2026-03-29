import { useState, useEffect } from 'react';
import { PageBanner } from '@/components/layout/PageBanner';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Calendar, Search, Copy, Edit, Trash2, TrendingUp, Filter, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { workoutApi } from '@/services/api/workoutApi';
import { exerciseTemplatesApi } from '@/services/api/exerciseTemplatesApi';
import userService from '@/services/api/userService';
import { useLocation, useNavigate } from 'react-router-dom';
import { Workout } from '@/types/workout';
import { DateRangePicker } from '@/components/DateRangePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Filler } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VolumeDataPoint {
  date: string;
  volume: number;
  workoutName: string;
}

export const WorkoutList = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  // Graph state
  const [selectedExercise, setSelectedExercise] = useState<string>('all');
  const [exercises, setExercises] = useState<Array<{ id: string; name: string }>>([]);
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
  const [members, setMembers] = useState<Array<{ id: string; firstName: string; lastName: string; username: string }>>([]);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | 'all'>('all');
  const [isAdminOrTrainer, setIsAdminOrTrainer] = useState(false);

  // Fetch workouts and exercises
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Check user role and load members list for admin/trainer
        try {
          const profile = await userService.getCurrentUserProfile();
          console.debug('WorkoutList: profile', profile);
          if (profile && (profile.roles?.includes('ADMIN') || profile.roles?.includes('TRAINER'))) {
            setIsAdminOrTrainer(true);
            const membersResp = await userService.getAllMembers();
            console.debug('WorkoutList: membersResp', membersResp);
            if (membersResp) setMembers(membersResp);
          }
        } catch (e: any) {
          console.error('WorkoutList: failed to load profile or members', e?.message || e);
          toast({ title: 'Warning', description: 'Unable to load members. Check your authentication.', variant: 'destructive' });
        }

        // Determine requested member id from selected filter or url
        const queryParams = new URLSearchParams(location.search);
        const requestedMemberId = queryParams.get('memberId') || (selectedMemberFilter && selectedMemberFilter !== 'all' ? selectedMemberFilter : undefined);
        let workoutsResponse;
        try {
          workoutsResponse = await workoutApi.getAll(requestedMemberId || undefined);
          console.debug('WorkoutList: workoutsResponse', workoutsResponse);
        } catch (wx) {
          console.error('WorkoutList: workouts API error', wx);
          workoutsResponse = { data: [] };
        }
        const allWorkouts = workoutsResponse?.data || [];

        // Respect role-based visibility:
        // - ADMIN: see all workouts
        // - TRAINER: see workouts for assigned members only
        // - MEMBER: see only their own workouts
        try {
          const profile = await userService.getCurrentUserProfile();
          let filteredWorkouts = [...allWorkouts];

          if (profile.roles?.includes('ADMIN')) {
            console.debug('User is ADMIN, showing all workouts', allWorkouts.length);
            filteredWorkouts = allWorkouts;
          } else if (profile.roles?.includes('TRAINER')) {
            const assigned = profile.assignedMembers || [];
            console.debug('User is TRAINER, assignedMembers=', assigned);
            if (requestedMemberId) {
              if (!assigned.includes(requestedMemberId)) {
                toast({ title: 'Access denied', description: 'You are not assigned to this member.', variant: 'destructive' });
                filteredWorkouts = allWorkouts.filter(w => w.member && assigned.includes(w.member.id));
              } else {
                filteredWorkouts = allWorkouts.filter(w => w.member && w.member.id === requestedMemberId);
              }
            } else {
              filteredWorkouts = allWorkouts.filter(w => w.member && assigned.includes(w.member.id));
            }
          } else if (profile.roles?.includes('MEMBER')) {
            filteredWorkouts = allWorkouts.filter(w => w.member && w.member.id === profile.id);
          }

          // Sort workouts by date (newest first)
          filteredWorkouts.sort((a, b) =>
            new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
          );
          setWorkouts(filteredWorkouts);
        } catch (err) {
          console.error('Failed to fetch profile for role-based filtering:', err);
          // Sort all workouts by date (newest first) as fallback
          setWorkouts([...allWorkouts].sort((a, b) =>
            new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
          ));
        }

        // Fetch exercises for filter
        const exercisesResponse = await exerciseTemplatesApi.getAll();
        if (exercisesResponse?.data) {
          setExercises(exercisesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workouts. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast, selectedMemberFilter, location.search]);

  // Filter workouts based on search and date range
  useEffect(() => {
    let filtered = [...workouts];
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(workout =>
        workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workout.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(workout => {
        const workoutDate = new Date(workout.scheduledDate);
        const fromDate = dateRange.from ? new Date(dateRange.from) : new Date(0);
        const toDate = dateRange.to ? new Date(dateRange.to) : new Date();
        return workoutDate >= fromDate && workoutDate <= toDate;
      });
    }
    setFilteredWorkouts(filtered);
  }, [workouts, searchTerm, dateRange]);

  // Generate volume data for graph
  useEffect(() => {
    const generateVolumeData = async () => {
      if (workouts.length === 0) return;
      setGraphLoading(true);
      try {
        let relevantWorkouts = [...workouts];
        if (selectedExercise !== 'all') {
          relevantWorkouts = workouts.filter(workout =>
            workout.sets.some(set => set.exercise.id === selectedExercise)
          );
        }
        // Group by date and calculate total volume
        const volumeMap = new Map<string, { volume: number; workoutNames: string[] }>();
        relevantWorkouts.forEach(workout => {
          const date = format(new Date(workout.scheduledDate), 'yyyy-MM-dd');
          let workoutVolume = 0;
          workout.sets.forEach(set => {
            if (selectedExercise === 'all' || set.exercise.id === selectedExercise) {
              const weight = set.weight || 0;
              const reps = set.reps || 0;
              workoutVolume += weight * reps;
            }
          });
          if (volumeMap.has(date)) {
            const existing = volumeMap.get(date)!;
            existing.volume += workoutVolume;
            existing.workoutNames.push(workout.name);
          } else {
            volumeMap.set(date, { volume: workoutVolume, workoutNames: [workout.name] });
          }
        });
        // Convert to array and sort by date (ascending for graph)
        const data: VolumeDataPoint[] = Array.from(volumeMap.entries())
          .map(([date, { volume, workoutNames }]) => ({
            date,
            volume: Math.round(volume * 100) / 100,
            workoutName: workoutNames.join(', ')
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setVolumeData(data);
      } catch (error) {
        console.error('Error generating volume data:', error);
      } finally {
        setGraphLoading(false);
      }
    };
    generateVolumeData();
  }, [workouts, selectedExercise]);

  const handleDeleteWorkout = async () => {
    if (!workoutToDelete) return;
    setDeleting(true);
    try {
      await workoutApi.delete(workoutToDelete.id);
      setWorkouts(workouts.filter(w => w.id !== workoutToDelete.id));
      toast({
        title: 'Success',
        description: 'Workout deleted successfully!',
      });
      setShowDeleteDialog(false);
      setWorkoutToDelete(null);
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (workout: Workout) => {
    setWorkoutToDelete(workout);
    setShowDeleteDialog(true);
  };

  const handleMarkComplete = async (workout: Workout) => {
    setCompletingIds(prev => new Set(prev).add(workout.id));
    try {
      await workoutApi.completeWorkout(workout.id);
      setWorkouts(prev => prev.map(w =>
        w.id === workout.id
          ? { ...w, completed: true, sets: w.sets.map(s => ({ ...s, completed: true })) }
          : w
      ));
      toast({ title: 'Workout completed!', description: `${workout.name} marked as complete.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to mark workout as complete.', variant: 'destructive' });
    } finally {
      setCompletingIds(prev => { const next = new Set(prev); next.delete(workout.id); return next; });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lb-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBanner
        title="My Workouts"
        subtitle="Track and manage your training sessions"
        imageUrl="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80&auto=format&fit=crop"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex gap-2">
          <Link to="/dashboard/workouts/templates" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Use Templates
            </Button>
          </Link>
          <Link to="/dashboard/workouts/new" className="flex-1 sm:flex-none">
            <Button className="w-full bg-lb-accent hover:bg-lb-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              New Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Volume Progress Graph Card */}
      <Card className="p-6 bg-lb-card border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-lb-accent" />
            Volume Progress
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-full sm:w-[200px] bg-lb-darker border-white/20 text-white">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent className="bg-lb-card border-white/10">
                <div className="p-2 border-b border-white/10">
                  <Input
                    placeholder="Search exercises..."
                    value={exerciseSearchTerm}
                    onChange={(e) => setExerciseSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="bg-lb-darker border-white/20 text-white placeholder:text-gray-500 h-8 text-sm"
                  />
                </div>
                <SelectItem value="all" className="text-white hover:bg-lb-darker">All Exercises</SelectItem>
                {exercises
                  .filter(e => e.name.toLowerCase().includes(exerciseSearchTerm.toLowerCase()))
                  .map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id} className="text-white hover:bg-lb-darker">
                      {exercise.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {graphLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lb-accent"></div>
          </div>
        ) : volumeData.length > 0 ? (
          <div className="w-full h-64">
            <Line
              data={{
                labels: volumeData.map(d => d.date),
                datasets: [
                  {
                    label: selectedExercise === 'all' ? 'Total Volume (kg)' : exercises.find(e => e.id === selectedExercise)?.name + ' Volume (kg)',
                    data: volumeData.map(d => d.volume),
                    borderColor: 'rgb(249, 115, 22)',
                    backgroundColor: 'rgba(249, 115, 22, 0.12)',
                    pointBackgroundColor: 'rgb(249, 115, 22)',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Date',
                      color: '#9CA3AF',
                    },
                    ticks: {
                      color: '#9CA3AF',
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Volume (kg)',
                      color: '#9CA3AF',
                    },
                    ticks: {
                      color: '#9CA3AF',
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: { color: 'rgba(255,255,255,0.6)', usePointStyle: true },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(15,15,25,0.92)',
                    borderColor: 'rgba(249,115,22,0.3)',
                    borderWidth: 1,
                    titleColor: 'white',
                    bodyColor: 'rgba(255,255,255,0.7)',
                    callbacks: {
                      afterBody: (context) => {
                        const dataPoint = volumeData[context[0].dataIndex];
                        return [`Workouts: ${dataPoint.workoutName}`];
                      },
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            {selectedExercise === 'all'
              ? 'No workout data available to display volume progress.'
              : 'No volume data available for the selected exercise.'
            }
            {workouts.length > 0 && (
              <div className="mt-4">
                <p className="text-sm">You have {workouts.length} workout(s) but no volume data.</p>
                <p className="text-xs text-gray-500">Add weight and reps to your sets to see volume progress.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-lb-darker border-white/20 text-white placeholder:text-gray-500 w-full"
          />
        </div>
        {isAdminOrTrainer && (
          <div className="w-full sm:w-auto flex items-center gap-2">
            <Select value={selectedMemberFilter} onValueChange={(v) => setSelectedMemberFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[220px] bg-lb-darker border-white/20 text-white">
                <SelectValue placeholder="Filter by member" />
              </SelectTrigger>
              <SelectContent className="bg-lb-card border-white/10">
                <SelectItem value="all" className="text-white hover:bg-lb-darker">All Members</SelectItem>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id} className="text-white hover:bg-lb-darker">
                    {m.firstName} {m.lastName} ({m.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={async () => {
              try {
                const resp = await userService.getAllMembers();
                console.debug('Manual refresh members', resp);
                if (resp) setMembers(resp);
                toast({ title: 'Refreshed', description: 'Members list refreshed' });
              } catch (e) {
                console.error('Failed to refresh members', e);
                toast({ title: 'Error', description: 'Failed to refresh members', variant: 'destructive' });
              }
            }}>Refresh</Button>
            {members.length === 0 && <span className="text-sm text-gray-400 ml-2">No members loaded</span>}
          </div>
        )}
        <DateRangePicker
          onChange={(dr) => {
            const from = dr?.from;
            const to = dr?.to;
            setDateRange({ from, to });
          }}
        />
      </div>

      {/* Workouts List */}
      {filteredWorkouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkouts.map((workout) => {
            const completedSets = workout.sets.filter(s => s.completed).length;
            const totalSets = workout.sets.length;
            const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
            return (
              <Card
                key={workout.id}
                className="glass-card p-4 hover:translate-y-[-2px] transition-all flex flex-col cursor-pointer"
                onClick={() => navigate(`/dashboard/workouts/${workout.id}`)}
              >
                {/* Name + completed badge */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-white leading-tight flex-1 min-w-0 truncate">{workout.name}</h3>
                  {workout.completed && (
                    <span className="shrink-0 text-xs bg-green-900/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                      Completed
                    </span>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>{format(new Date(workout.scheduledDate), 'MMM dd, yyyy')}</span>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>{completedSets} / {totalSets} sets</span>
                    <span className="font-medium text-white">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${workout.completed ? 'bg-green-500' : 'bg-lb-accent'}`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                {!workout.completed && (
                  <div className="mt-auto pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleMarkComplete(workout); }}
                      disabled={completingIds.has(workout.id)}
                      className="w-full bg-green-600/20 hover:bg-green-600/40 text-green-400 border-green-500/30"
                    >
                      <CheckCircle className="h-4 w-4 mr-1.5" />
                      {completingIds.has(workout.id) ? 'Saving...' : 'Mark Complete'}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-6">
          <div className="bg-lb-darker rounded-full p-4 inline-flex mb-4">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-white">No workouts found</h3>
          <p className="text-gray-400">
            {workouts.length === 0
              ? "You haven't created any workouts yet. Start by creating your first workout!"
              : searchTerm || dateRange.from || dateRange.to
              ? "Try adjusting your search criteria or date range"
              : "No workouts available."}
          </p>
          {workouts.length === 0 && (
            <Link to="/dashboard/workouts/new" className="mt-4 inline-block">
              <Button className="bg-lb-accent hover:bg-lb-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Workout
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{workoutToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkout}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutList;
