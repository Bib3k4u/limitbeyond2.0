import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Calendar, Search, Copy, Edit, Trash2, TrendingUp, Filter } from 'lucide-react';
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
  Legend
  ,
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
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(
    { from: undefined, to: undefined }
  );
  // Graph state
  const [selectedExercise, setSelectedExercise] = useState<string>('all');
  const [exercises, setExercises] = useState<Array<{ id: string; name: string }>>([]);
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
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
          // show a non-blocking toast so admin notices
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
          // requestedMemberId is already used server-side; here enforce visibility
          if (profile.roles?.includes('ADMIN')) {
            console.debug('User is ADMIN, showing all workouts', allWorkouts.length);
            setWorkouts(allWorkouts);
          } else if (profile.roles?.includes('TRAINER')) {
            const assigned = profile.assignedMembers || [];
            console.debug('User is TRAINER, assignedMembers=', assigned);
            // If trainer requested a specific member, ensure it's assigned to them
            if (requestedMemberId) {
              if (!assigned.includes(requestedMemberId)) {
                toast({ title: 'Access denied', description: 'You are not assigned to this member.', variant: 'destructive' });
                // fallback to assigned members' workouts
                setWorkouts(allWorkouts.filter(w => w.member && assigned.includes(w.member.id)));
              } else {
                setWorkouts(allWorkouts.filter(w => w.member && w.member.id === requestedMemberId));
              }
            } else {
              setWorkouts(allWorkouts.filter(w => w.member && assigned.includes(w.member.id)));
            }
          } else if (profile.roles?.includes('MEMBER')) {
            // Members can only view their own workouts; ignore requestedMemberId
            setWorkouts(allWorkouts.filter(w => w.member && w.member.id === profile.id));
          } else {
            // default fallback
            setWorkouts(allWorkouts);
          }
        } catch (err) {
          // If profile fetch fails, fall back to showing all workouts (safer) and log
          console.error('Failed to fetch profile for role-based filtering:', err);
          setWorkouts(allWorkouts);
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
    let filtered = workouts;

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
        let relevantWorkouts = workouts;

        if (selectedExercise !== 'all') {
          // Filter workouts that contain the selected exercise
          relevantWorkouts = workouts.filter(workout =>
            workout.sets.some(set => set.exercise.id === selectedExercise)
          );
        }

        // Group by date and calculate total volume
        const volumeMap = new Map<string, { volume: number; workoutNames: string[] }>();

        relevantWorkouts.forEach(workout => {
          const date = format(new Date(workout.scheduledDate), 'yyyy-MM-dd');
          let workoutVolume = 0;

          // Calculate volume for this workout
          workout.sets.forEach(set => {
            if (selectedExercise === 'all' || set.exercise.id === selectedExercise) {
              const weight = set.weight || 0;
              const reps = set.reps || 0;
              workoutVolume += weight * reps;
            }
          });

          // Include workouts even with 0 volume to show all workout days
          if (volumeMap.has(date)) {
            const existing = volumeMap.get(date)!;
            existing.volume += workoutVolume;
            existing.workoutNames.push(workout.name);
          } else {
            volumeMap.set(date, { volume: workoutVolume, workoutNames: [workout.name] });
          }
        });

        // Convert to array and sort by date
        const data: VolumeDataPoint[] = Array.from(volumeMap.entries())
          .map(([date, { volume, workoutNames }]) => ({
            date,
            volume: Math.round(volume * 100) / 100, // Round to 2 decimal places
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lb-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Workouts</h1>
        <div className="flex gap-2">
          <Link to="/dashboard/workouts/templates">
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Use Templates
            </Button>
          </Link>
          <Link to="/dashboard/workouts/new">
            <Button className="bg-lb-accent hover:bg-lb-accent/90">
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
                <SelectItem value="all" className="text-white hover:bg-lb-darker">All Exercises</SelectItem>
                {exercises.map((exercise) => (
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
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
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
                    labels: {
                      color: '#D1D5DB',
                    },
                  },
                  tooltip: {
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
          {filteredWorkouts.map((workout) => (
            <Card key={workout.id} className="glass-card p-4 hover:translate-y-[-2px] transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-white">{workout.name}</h3>
                  {workout.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {workout.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">
                      {format(new Date(workout.scheduledDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-400">{workout.sets.length} sets</span>
                    {workout.completed && (
                      <span className="text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <Link to={`/dashboard/workouts/${workout.id}`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                      View
                    </Button>
                  </Link>
                  <Link to={`/dashboard/workouts/edit/${workout.id}`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(workout)}
                    className="text-red-400 border-red-500/50 hover:bg-red-500/20 w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
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
