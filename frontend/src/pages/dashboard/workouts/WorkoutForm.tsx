import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Plus, Trash2, Search, Calculator, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { workoutApi } from '@/services/api/workoutApi';
import { exerciseTemplatesApi } from '@/services/api/exerciseTemplatesApi';
import userService from '@/services/api/userService';
import { WorkoutRequest } from '@/types/workout';
import { format } from 'date-fns';

// Define interfaces locally since they're not in types directory
interface ExerciseTemplate {
  id: string;
  name: string;
  description?: string;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface WorkoutFormData {
  name: string;
  description: string;
  memberId: string;
  scheduledDate: string;
  notes: string;
}

interface SelectedExercise {
  exerciseId: string;
  exerciseName: string;
  sets: Array<{
    id: string;
    reps: number;
    weight: number;
    notes: string;
  }>;
}

const WorkoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<ExerciseTemplate[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [previousVolumes, setPreviousVolumes] = useState<Record<string, number>>({});

  const form = useForm<WorkoutFormData>({
    defaultValues: {
      name: '',
      description: '',
      memberId: '',
      scheduledDate: '',
      notes: '',
    },
  });

  // Simplified validation rules
  const nameRules = { required: 'Workout name is required' };
  const dateRules = { required: 'Date is required' };
  const memberRules = currentUser?.roles.includes('TRAINER') || currentUser?.roles.includes('ADMIN') 
    ? { required: 'Member is required' } 
    : {};

  // Filter exercises based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExercises(exercises);
    } else {
      setFilteredExercises(
        exercises.filter(exercise =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, exercises]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        // Load exercises
        const exercisesResponse = await exerciseTemplatesApi.getAll();
        if (exercisesResponse?.data) {
          setExercises(exercisesResponse.data);
        }

        // Load current user
        const userProfile = await userService.getCurrentUserProfile();
        if (userProfile) {
          setCurrentUser(userProfile);
          
          // Load members if user is trainer/admin
          if (userProfile.roles.includes('TRAINER') || userProfile.roles.includes('ADMIN')) {
            const membersResponse = await userService.getAllMembers();
            // userService.getAllMembers() returns the data array directly (not an axios response object)
            if (membersResponse) {
              setMembers(membersResponse);
            }
          }
        }

        // Load existing workout data if editing
    if (id) {
          const workoutResponse = await workoutApi.getById(id);
          if (workoutResponse?.data) {
            const workout = workoutResponse.data;
            form.reset({
              name: workout.name,
              description: workout.description || '',
              memberId: workout.member?.id || '',
              scheduledDate: workout.scheduledDate ? format(new Date(workout.scheduledDate), 'yyyy-MM-dd') : '',
              notes: workout.notes || '',
            });

            // Convert existing sets to selected exercises format
            const exerciseMap = new Map<string, SelectedExercise>();
            workout.sets.forEach(set => {
              if (!exerciseMap.has(set.exercise.id)) {
                exerciseMap.set(set.exercise.id, {
                exerciseId: set.exercise.id,
                  exerciseName: set.exercise.name,
                  sets: []
                });
              }
              exerciseMap.get(set.exercise.id)!.sets.push({
                id: set.id,
                reps: set.reps,
                weight: set.weight || 0,
                notes: set.notes || ''
              });
            });
            setSelectedExercises(Array.from(exerciseMap.values()));
          }
          }
        } catch (error) {
        console.error('Error loading data:', error);
        setDataError('Failed to load data. Please try again.');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, form]);

  // Watch the selected member id from the form
  const memberIdValue = form.watch('memberId');

  // Compute current total volume for an exercise
  const computeCurrentVolume = (exercise: SelectedExercise) => {
    return exercise.sets.reduce((acc, s) => acc + ((s.weight || 0) * (s.reps || 0)), 0);
  };

  // Fetch previous workouts for the selected member (or current user) and compute previous volume per exercise
  useEffect(() => {
    const fetchPreviousVolumes = async () => {
      try {
        const memberToQuery = memberIdValue || currentUser?.id;
        if (!memberToQuery) {
          setPreviousVolumes({});
          return;
        }

        const resp = await workoutApi.getAll(memberToQuery);
        const workouts = resp?.data || [];

        // Sort workouts by scheduledDate (descending) to find the most recent
        workouts.sort((a: any, b: any) => {
          const ad = a.scheduledDate || a.date || null;
          const bd = b.scheduledDate || b.date || null;
          return new Date(bd || 0).getTime() - new Date(ad || 0).getTime();
        });

        const map: Record<string, number> = {};

        // For each selected exercise, find the most recent workout that includes it
        for (const se of selectedExercises) {
          const found = workouts.find((w: any) => (w.sets || []).some((s: any) => s.exercise?.id === se.exerciseId));
          if (found) {
            const total = (found.sets || [])
              .filter((s: any) => s.exercise?.id === se.exerciseId)
              .reduce((acc: number, s: any) => acc + ((s.weight || 0) * (s.reps || 0)), 0);
            map[se.exerciseId] = total;
          } else {
            map[se.exerciseId] = 0;
          }
        }

        setPreviousVolumes(map);
      } catch (e) {
        console.error('Failed to fetch previous workouts for volume calculation', e);
        setPreviousVolumes({});
      }
    };

    fetchPreviousVolumes();
    // Re-run when member changes or selected exercises change
  }, [memberIdValue, currentUser, selectedExercises.map(se => se.exerciseId).join(',')]);

  const handleExerciseSelect = (exercise: ExerciseTemplate) => {
    // Check if exercise is already selected
    if (selectedExercises.some(se => se.exerciseId === exercise.id)) {
          toast({
        title: 'Exercise already selected',
        description: `${exercise.name} is already in your workout.`,
            variant: 'destructive',
          });
      return;
    }

    const newSelectedExercise: SelectedExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{
        id: `new-${Date.now()}-${Math.random()}`,
        reps: 10,
        weight: 0,
        notes: ''
      }]
    };

    setSelectedExercises([...selectedExercises, newSelectedExercise]);
    // Don't close the dialog - let user select multiple exercises
    setSearchTerm('');
  };

  const addSetToExercise = (exerciseIndex: number) => {
    const updatedExercises = [...selectedExercises];
    const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
    updatedExercises[exerciseIndex].sets.push({
      id: `new-${Date.now()}-${Math.random()}`,
      reps: lastSet ? lastSet.reps : 10,
      weight: lastSet ? lastSet.weight : 0,
      notes: lastSet ? lastSet.notes : ''
    });
    setSelectedExercises(updatedExercises);
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    
    // Remove exercise if no sets remain
    if (updatedExercises[exerciseIndex].sets.length === 0) {
      updatedExercises.splice(exerciseIndex, 1);
    }
    
    setSelectedExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: any) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value
    };
    setSelectedExercises(updatedExercises);
  };

  const removeExercise = (exerciseIndex: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(exerciseIndex, 1);
    setSelectedExercises(updatedExercises);
  };

  const onSubmit = async (data: WorkoutFormData) => {
    if (selectedExercises.length === 0) {
      toast({
        title: 'No exercises selected',
        description: 'Please add at least one exercise to your workout.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Convert selected exercises to workout sets format
      const sets = selectedExercises.flatMap(exercise => 
        exercise.sets.map(set => ({
          exerciseId: exercise.exerciseId,
          reps: set.reps,
          weight: set.weight,
          notes: set.notes
        }))
      );

      const payload = {
        ...data,
        sets,
        date: data.scheduledDate ? format(new Date(data.scheduledDate), 'yyyy-MM-dd') : undefined,
      };

      // For regular users, don't send memberId if not set
      if (!currentUser?.roles.includes('TRAINER') && !currentUser?.roles.includes('ADMIN')) {
        delete payload.memberId;
      }

      // Remove the scheduledDate field to avoid confusion
      delete payload.scheduledDate;

      if (id) {
        await workoutApi.update(id, payload);
        toast({
          title: 'Success',
          description: 'Workout updated successfully',
        });
      } else {
        await workoutApi.create(payload);
        toast({
          title: 'Success',
          description: 'Workout created successfully',
        });
      }

      navigate('/dashboard/workouts');
    } catch (error: any) {
      console.error('Error saving workout:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save workout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-lb-accent" />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 mb-4">{dataError}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{id ? 'Edit Workout' : 'Create New Workout'}</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard/workouts')}>
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
              rules={nameRules}
                render={({ field }) => (
                  <FormItem>
                  <FormLabel className="text-white">Workout Name *</FormLabel>
                    <FormControl>
                    <Input 
                      placeholder="Enter workout name" 
                      {...field} 
                      className="bg-lb-dark border-white/20 text-white placeholder:text-gray-500"
                    />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="scheduledDate"
              rules={dateRules}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Date *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="bg-lb-dark border-white/20 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter workout description"
                        {...field}
                    className="bg-lb-dark border-white/20 text-white placeholder:text-gray-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

          {(currentUser?.roles.includes('TRAINER') || currentUser?.roles.includes('ADMIN')) && (
                <FormField
                  control={form.control}
                  name="memberId"
              rules={memberRules}
                  render={({ field }) => (
                    <FormItem>
                  <FormLabel className="text-white">Member *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                      <SelectTrigger className="bg-lb-dark border-white/20 text-white">
                        <SelectValue placeholder="Select a member" />
                          </SelectTrigger>
                        </FormControl>
                    <SelectContent className="bg-lb-card border-white/10">
                          {members.map((member) => (
                        <SelectItem key={member.id} value={member.id} className="text-white hover:bg-lb-darker">
                          {member.firstName} {member.lastName} ({member.username})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
            name="notes"
                render={({ field }) => (
                  <FormItem>
                <FormLabel className="text-white">Notes</FormLabel>
                    <FormControl>
                  <Textarea 
                    placeholder="Enter any additional notes" 
                    {...field} 
                    className="bg-lb-dark border-white/20 text-white placeholder:text-gray-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

          {/* Exercise Selection Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-white">Exercises</h2>
              <Button
                type="button"
                onClick={() => setShowExerciseSelector(true)}
                className="bg-lb-accent hover:bg-lb-accent/90 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise ({selectedExercises.length})
              </Button>
            </div>

            {selectedExercises.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed border-white/20 rounded-lg bg-lb-darker/50">
                <p className="text-gray-400">No exercises selected yet. Click "Add Exercise" to get started.</p>
              </div>
            )}

            {selectedExercises.map((exercise, exerciseIndex) => (
              <Card key={exercise.exerciseId} className="p-4 bg-lb-card border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-white">{exercise.exerciseName}</h3>
                      {/* Previous volume tag */}
                      <Badge variant="secondary" className="text-sm bg-white/5 text-gray-200">
                        Prev: {Number((previousVolumes[exercise.exerciseId] || 0)).toFixed(0)} kg
                      </Badge>
                      {/* Current computed volume tag */}
                      <Badge variant="secondary" className="text-sm bg-white/5 text-gray-200">
                        Current: {Number(computeCurrentVolume(exercise)).toFixed(0)} kg
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      {exercises.find(e => e.id === exercise.exerciseId)?.description || 'No description available'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExercise(exerciseIndex)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-lb-darker border border-white/10 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-white">Set {setIndex + 1}</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                              type="number"
                            placeholder="Reps"
                            value={set.reps}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className="w-20 bg-lb-dark border-white/20 text-white"
                            min="1"
                          />
                          <span className="text-sm text-gray-400">reps</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                              type="number"
                            placeholder="Weight"
                            value={set.weight}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                            className="w-20 bg-lb-dark border-white/20 text-white"
                            min="0"
                              step="0.5"
                          />
                          <span className="text-sm text-gray-400">kg</span>
                        </div>
                      </div>

                      <Input
                        placeholder="Notes"
                        value={set.notes}
                        onChange={(e) => updateSet(exerciseIndex, setIndex, 'notes', e.target.value)}
                        className="flex-1 bg-lb-dark border-white/20 text-white placeholder:text-gray-500"
                      />

                      {exercise.sets.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSetFromExercise(exerciseIndex, setIndex)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20 w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                  </div>
                  ))}

                    <Button
                      type="button"
                    variant="outline"
                      size="sm"
                    onClick={() => addSetToExercise(exerciseIndex)}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Set
                    </Button>
                </div>
              </Card>
              ))}
            </div>

          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              disabled={loading || selectedExercises.length === 0}
              className="bg-lb-accent hover:bg-lb-accent/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Workout'
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-lb-card border border-white/10 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Select Exercises</h2>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExerciseSelector(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Done ({selectedExercises.length} selected)
                </Button>
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-lb-darker border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredExercises.map((exercise) => {
                const isSelected = selectedExercises.some(se => se.exerciseId === exercise.id);
                return (
                  <div
                    key={exercise.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-lb-accent/20 border-lb-accent/50' 
                        : 'bg-lb-darker border-white/10 hover:bg-white/5'
                    }`}
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    <div>
                      <h3 className={`font-medium ${isSelected ? 'text-lb-accent' : 'text-white'}`}>
                        {exercise.name}
                      </h3>
                      {exercise.description && (
                        <p className={`text-sm mt-1 ${isSelected ? 'text-lb-accent/80' : 'text-gray-400'}`}>
                          {exercise.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-lb-accent">Selected</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExercises(selectedExercises.filter(se => se.exerciseId !== exercise.id));
                            }}
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExerciseSelect(exercise);
                          }}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutForm;
