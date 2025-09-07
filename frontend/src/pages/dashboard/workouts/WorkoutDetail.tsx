import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft, Copy, Edit, Trash2, CheckCircle, Circle,
  Calendar, User, Target, ChevronDown, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { workoutApi } from '@/services/api/workoutApi';
import { WorkoutResponse } from '@/types/workout';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface GroupedExercise {
  exerciseName: string;
  exerciseDescription: string;
  sets: Array<{
    id: string;
    reps: number;
    weight: number;
    notes: string;
    completed: boolean;
    volume: number;
  }>;
  totalVolume: number;
  completedSets: number;
  totalSets: number;
}

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workout, setWorkout] = useState<WorkoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const groupedExercises: GroupedExercise[] = workout ? (() => {
    const exerciseMap = new Map<string, GroupedExercise>();
    workout.sets.forEach(set => {
      const key = set.exercise.name;
      if (!exerciseMap.has(key)) {
        exerciseMap.set(key, {
          exerciseName: set.exercise.name,
          exerciseDescription: set.exercise.description || '',
          sets: [],
          totalVolume: 0,
          completedSets: 0,
          totalSets: 0
        });
      }
      const exercise = exerciseMap.get(key)!;
      const volume = (set.weight || 0) * set.reps;
      exercise.sets.push({
        id: set.id,
        reps: set.reps,
        weight: set.weight || 0,
        notes: set.notes || '',
        completed: set.completed,
        volume
      });
      exercise.totalVolume += volume;
      if (set.completed) exercise.completedSets++;
      exercise.totalSets++;
    });
    return Array.from(exerciseMap.values());
  })() : [];

  const completedSetsCount = workout?.sets.filter(set => set.completed).length ?? 0;
  const totalSetsCount = workout?.sets.length ?? 0;
  const overallProgress = totalSetsCount > 0 ? (completedSetsCount / totalSetsCount) * 100 : 0;

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await workoutApi.getById(id);
        if (response?.data) setWorkout(response.data);
      } catch (error) {
        console.error('Error fetching workout:', error);
        toast({
          title: 'Error',
          description: 'Failed to load workout details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [id, toast]);

  const handleCompleteSet = async (setId: string) => {
    if (!workout) return;
    try {
      const response = await workoutApi.completeSet(workout.id, setId);
      if (response?.data) {
        setWorkout(response.data);
        toast({ title: 'Success', description: 'Set marked as completed!' });
      }
    } catch (error) {
      console.error('Error completing set:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete set. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUncompleteSet = async (setId: string) => {
    if (!workout) return;
    try {
      const response = await workoutApi.uncompleteSet(workout.id, setId);
      if (response?.data) {
        setWorkout(response.data);
        toast({ title: 'Success', description: 'Set marked as not completed.' });
      }
    } catch (error) {
      console.error('Error uncompleting set:', error);
      toast({
        title: 'Error',
        description: 'Failed to uncomplete set. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteWorkout = async () => {
    if (!workout) return;
    setCompleting(true);
    try {
      const response = await workoutApi.completeWorkout(workout.id);
      if (response?.data) {
        setWorkout(response.data);
        toast({ title: 'Success', description: 'Workout completed! Great job!' });
      }
    } catch (error) {
      console.error('Error completing workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCompleting(false);
    }
  };

  const handleCopyWorkout = () => {
    if (!workout) return;
    const qp = new URLSearchParams();
    qp.set('copyFrom', workout.id);
    if (selectedDate) qp.set('date', format(selectedDate, 'yyyy-MM-dd'));
    setShowCopyDialog(false);
    navigate(`/dashboard/workouts/new?${qp.toString()}`);
  };

  const handleDeleteWorkout = async () => {
    if (!workout) return;
    setDeleting(true);
    try {
      await workoutApi.delete(workout.id);
      toast({ title: 'Success', description: 'Workout deleted successfully!' });
      navigate('/dashboard/workouts');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lb-accent"></div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 mb-4">Workout not found</p>
        <Button onClick={() => navigate('/dashboard/workouts')}>Back to Workouts</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/workouts')}
            className="h-9 px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold truncate">{workout.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCopyDialog(true)}
            className="h-9 px-3 min-w-[90px]"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/workouts/edit/${workout.id}`)}
            className="h-9 px-3 min-w-[90px]"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="h-9 px-3 min-w-[90px] text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-4 sm:mb-0 sm:ml-[60px]">
        {workout.description}
      </p>

      {/* Workout Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-lb-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-white">
              {workout.scheduledDate ? format(new Date(workout.scheduledDate), 'MMM dd, yyyy') : 'Not scheduled'}
            </p>
          </CardContent>
        </Card>
        {/* <Card className="bg-lb-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <User className="h-4 w-4" />
              Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-white">
              {workout.member ? `${workout.member.firstName} ${workout.member.lastName}` : 'Not assigned'}
            </p>
          </CardContent>
        </Card> */}
        <Card className="bg-lb-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{completedSetsCount} of {totalSetsCount} sets</span>
                <span className="text-lb-accent">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Workout Button */}
      {!workout.completed && (
        <Card className="bg-lb-accent/5 border-lb-accent/20">
          <CardContent className="pt-4">
            <div className="flex flex-col space-y-2">
              <div>
                <h3 className="font-semibold text-white">Complete All Sets</h3>
                <p className="text-sm text-gray-400">
                  Mark all sets as completed to finish this workout
                </p>
              </div>
              <Button
                onClick={handleCompleteWorkout}
                disabled={completing || overallProgress === 100}
                className="bg-lb-accent hover:bg-lb-accent/90 w-full sm:w-auto"
              >
                {completing ? 'Completing...' : 'Complete Workout'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercises Accordion */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Exercises</h2>
        {groupedExercises.map((exercise, exerciseIndex) => (
          <Card key={exerciseIndex} className="overflow-hidden bg-lb-card border-white/10">
            <CardHeader
              className="pb-3 cursor-pointer"
              onClick={() =>
                setExpandedExercise(
                  expandedExercise === exercise.exerciseName ? null : exercise.exerciseName
                )
              }
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  {expandedExercise === exercise.exerciseName ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {exercise.exerciseName}
                </CardTitle>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total Volume</div>
                  <div className="text-lg font-semibold text-lb-accent">
                    {exercise.totalVolume} kg
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">
                    {exercise.completedSets} of {exercise.totalSets} sets completed
                  </span>
                  <span className="text-lb-accent">
                    {Math.round((exercise.completedSets / exercise.totalSets) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-lb-darker rounded-full h-2">
                  <div
                    className="bg-lb-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(exercise.completedSets / exercise.totalSets) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardHeader>{/* Collapsible Sets */}
            {expandedExercise === exercise.exerciseName && (
              <CardContent className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`flex flex-col space-y-2 p-3 rounded-lg border ${
                      set.completed ? 'bg-green-900/20 border-green-500/30' : 'bg-lb-darker border-white/10'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-300">Set {setIndex + 1}</span>
                      <span className="text-sm text-white">{set.reps} reps</span>
                      {set.weight > 0 && (
                        <>
                          <span className="text-gray-500">@</span>
                          <span className="text-sm font-medium text-white">{set.weight} kg</span>
                        </>
                      )}
                      {set.volume > 0 && (
                        <Badge variant="outline" className="text-xs border-lb-accent/30 text-lb-accent">
                          Volume: {set.volume}
                        </Badge>
                      )}
                      {set.notes && (
                        <span className="text-xs text-gray-400 italic">"{set.notes}"</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {set.completed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUncompleteSet(set.id)}
                          className="text-green-400 border-green-500/30 hover:bg-green-500/20 w-full sm:w-auto"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteSet(set.id)}
                          className="bg-lb-accent hover:bg-lb-accent/90 w-full sm:w-auto"
                        >
                          <Circle className="h-4 w-4 mr-1" />
                          Complete Set
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Copy Workout Dialog */}
      <AlertDialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Choose a new date for the copied workout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCopyWorkout}>Copy Workout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Workout Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout? This action cannot be undone.
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

export default WorkoutDetail;
