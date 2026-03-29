import React, { useState, useEffect } from 'react';
import { ExerciseVisualizer } from '@/components/workout/ExerciseVisualizer';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, Plus, Trash2, Search, Calculator, Check, ArrowUp, Sparkles, ChevronDown, TrendingUp } from 'lucide-react';
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
import { muscleGroupsApi } from '@/services/api/muscleGroupsApi';
import userService from '@/services/api/userService';
import { checkinApi } from '@/services/api/checkinApi';
import { aiWorkoutApi } from '@/services/api/aiWorkout';
import { WorkoutRequest } from '@/types/workout';
import { format } from 'date-fns';

// Define interfaces locally since they're not in types directory
interface ExerciseTemplate {
  id: string;
  name: string;
  description?: string;
  muscleGroups?: Array<{ id: string; name: string }>;
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
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<ExerciseTemplate[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [previousVolumes, setPreviousVolumes] = useState<Record<string, number>>({});
  const [previousSets, setPreviousSets] = useState<Record<string, Array<{ reps: number; weight: number }>>>({});
  const [allWorkoutsHistory, setAllWorkoutsHistory] = useState<any[]>([]);
  const [openHistoryIndex, setOpenHistoryIndex] = useState<number | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState<Record<string, boolean>>({});

  const handleAISuggestions = async (exerciseIndex: number) => {
    const exercise = selectedExercises[exerciseIndex];
    if (!exercise?.exerciseId) return;
    const exerciseId = exercise.exerciseId;

    setLoadingSuggestions(prev => ({ ...prev, [exerciseId]: true }));
    try {
      // Pull last 10 sessions for this exercise from already-fetched history
      const sessions: Array<Array<{ reps: number; weight: number; completed?: boolean }>> = allWorkoutsHistory
        .map(w => (w.sets || []).filter((s: any) => s.exercise?.id === exerciseId && s.weight > 0 && s.reps > 0)
          .map((s: any) => ({ reps: s.reps, weight: s.weight, completed: s.completed })))
        .filter(s => s.length > 0)
        .slice(-10);

      let suggestedSets: Array<{ reps: number; weight: number }>;
      let toastDesc: string;

      if (sessions.length > 0) {
        const lastSets = sessions[sessions.length - 1];
        // Progressive overload: increase weight if last session was completed or consistent
        // Check if all sets were at/above a good rep count
        const avgReps = lastSets.reduce((a, s) => a + s.reps, 0) / lastSets.length;
        const allCompleted = lastSets.every(s => s.completed !== false);
        const shouldProgress = allCompleted && avgReps >= 6;

        // Check last 3 sessions to see if weight has been stuck
        const recentWeights = sessions.slice(-3).map(sess =>
          sess.reduce((max, s) => Math.max(max, s.weight), 0)
        );
        const weightIsStuck = recentWeights.length >= 2 && recentWeights.every(w => w === recentWeights[0]);

        const increment = weightIsStuck || shouldProgress ? 2.5 : 0;

        suggestedSets = lastSets.map(s => ({
          reps: s.reps,
          weight: Math.round((s.weight + increment) * 2) / 2, // round to nearest 0.5kg
        }));

        const analysed = sessions.length;
        toastDesc = increment > 0
          ? `Analysed ${analysed} session${analysed > 1 ? 's' : ''} — progressed weight by +${increment}kg ↑`
          : `Analysed ${analysed} session${analysed > 1 ? 's' : ''} — consolidating at current weight`;
      } else {
        // No history at all — try backend, then fall back gracefully
        try {
          const resp = await aiWorkoutApi.getProgressiveOverload(exerciseId);
          const backendSets = resp?.data?.sets;
          if (Array.isArray(backendSets) && backendSets.length > 0) {
            suggestedSets = backendSets.map((s: any) => ({ reps: s.reps || 10, weight: s.weight || 20 }));
            toastDesc = 'AI-generated starter plan applied';
          } else {
            throw new Error('empty');
          }
        } catch {
          suggestedSets = [
            { reps: 10, weight: 20 },
            { reps: 10, weight: 20 },
            { reps: 10, weight: 20 },
          ];
          toastDesc = 'No history found — starter weights applied. Adjust as needed.';
        }
      }

      // Apply immediately — replace all sets on this exercise
      const updatedExercises = [...selectedExercises];
      updatedExercises[exerciseIndex] = {
        ...exercise,
        sets: suggestedSets.map((s, i) => ({
          id: `${exerciseId}-ai-${i}-${Date.now()}`,
          reps: s.reps,
          weight: s.weight,
          notes: '',
        })),
      };
      setSelectedExercises(updatedExercises);

      toast({ title: `✓ ${exercise.exerciseName} — progressive overload applied`, description: toastDesc });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not compute suggestions.', variant: 'destructive' });
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [exerciseId]: false }));
    }
  };

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

  // Helper: fetch exercises optionally by muscle group
  const fetchExercises = async (muscleGroupId?: string) => {
    try {
      if (muscleGroupId && muscleGroupId !== 'all') {
        const resp: any = await exerciseTemplatesApi.getByMuscleGroup(muscleGroupId);
        const data = resp?.data || [];
        setExercises(data);
        setFilteredExercises(
          (data as ExerciseTemplate[]).filter((exercise) =>
            searchTerm.trim() === ''
              ? true
              : exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else {
        const resp: any = await exerciseTemplatesApi.getAll();
        const data = resp?.data || [];
        setExercises(data);
        setFilteredExercises(
          (data as ExerciseTemplate[]).filter((exercise) =>
            searchTerm.trim() === ''
              ? true
              : exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
    } catch (e) {
      console.error('Failed to load exercises', e);
      setExercises([]);
      setFilteredExercises([]);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        
        // Load exercises
        await fetchExercises();

        // Load muscle groups
        try {
          const mgResp: any = await muscleGroupsApi.getAll();
          const mgData = mgResp?.data || [];
          setMuscleGroups(mgData);
        } catch (e) {
          console.warn('Failed to load muscle groups', e);
          setMuscleGroups([]);
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

        // Prefill from copyFrom query param when opening from detail copy
        const params = new URLSearchParams(location.search);
        const copyFromId = params.get('copyFrom');
        const prefillDate = params.get('date');
        // Prefill from sessionStorage (templates flow)
        if (!id && params.get('prefill') === '1') {
          try {
            const raw = sessionStorage.getItem('workoutPrefill');
            if (raw) {
              const pre = JSON.parse(raw);
              form.reset({
                name: pre.name || '',
                description: pre.description || '',
                memberId: pre.memberId || '',
                scheduledDate: pre.scheduledDate || '',
                notes: ''
              });
              const exerciseMap = new Map<string, SelectedExercise>();
              (pre.sets || []).forEach((s: any) => {
                const exId = s.exerciseId;
                if (!exerciseMap.has(exId)) {
                  const exName = (exercises.find(e => e.id === exId)?.name) || 'Exercise';
                  exerciseMap.set(exId, { exerciseId: exId, exerciseName: exName, sets: [] });
                }
                exerciseMap.get(exId)!.sets.push({
                  id: `new-${Date.now()}-${Math.random()}`,
                  reps: s.reps,
                  weight: s.weight || 0,
                  notes: s.notes || ''
                });
              });
              setSelectedExercises(Array.from(exerciseMap.values()));
            }
          } catch (e) {
            console.error('Failed to apply prefill from sessionStorage', e);
          }
        }
        if (!id && copyFromId) {
          try {
            const src = await workoutApi.getById(copyFromId);
            const workout = src?.data;
            if (workout) {
              form.reset({
                name: workout.name,
                description: workout.description || '',
                memberId: workout.member?.id || '',
                scheduledDate: prefillDate || (workout.scheduledDate ? format(new Date(workout.scheduledDate), 'yyyy-MM-dd') : ''),
                notes: ''
              });

              const exerciseMap = new Map<string, SelectedExercise>();
              (workout.sets || []).forEach((set: any) => {
                const exId = set.exercise.id;
                if (!exerciseMap.has(exId)) {
                  exerciseMap.set(exId, {
                    exerciseId: exId,
                    exerciseName: set.exercise.name,
                    sets: []
                  });
                }
                exerciseMap.get(exId)!.sets.push({
                  id: `new-${Date.now()}-${Math.random()}`,
                  reps: set.reps,
                  weight: set.weight || 0,
                  notes: set.notes || ''
                });
              });
              setSelectedExercises(Array.from(exerciseMap.values()));
            }
          } catch (e) {
            console.error('Failed to prefill from copyFrom', e);
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

  // Quick increment helpers for reps and weight
  const incrementSetValue = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
    delta: number
  ) => {
    const current = selectedExercises[exerciseIndex].sets[setIndex][field] || 0;
    const next =
      field === 'reps'
        ? Math.max(0, Math.round(current + delta))
        : Math.max(0, parseFloat((current + delta).toFixed(1)));
    updateSet(exerciseIndex, setIndex, field, next);
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

        // Store sorted ascending for history charts
        const ascSorted = [...workouts].sort((a: any, b: any) =>
          new Date(a.scheduledDate || a.date || 0).getTime() - new Date(b.scheduledDate || b.date || 0).getTime()
        );
        setAllWorkoutsHistory(ascSorted);

        // Sort workouts by scheduledDate (descending) to find the most recent
        workouts.sort((a: any, b: any) => {
          const ad = a.scheduledDate || a.date || null;
          const bd = b.scheduledDate || b.date || null;
          return new Date(bd || 0).getTime() - new Date(ad || 0).getTime();
        });

        const map: Record<string, number> = {};
        const setsMap: Record<string, Array<{ reps: number; weight: number }>> = {};

        // For each selected exercise, find the most recent workout that includes it
        for (const se of selectedExercises) {
          const found = workouts.find((w: any) => (w.sets || []).some((s: any) => s.exercise?.id === se.exerciseId));
          if (found) {
            const matchingSets = (found.sets || []).filter((s: any) => s.exercise?.id === se.exerciseId);
            const total = matchingSets.reduce((acc: number, s: any) => acc + ((s.weight || 0) * (s.reps || 0)), 0);
            map[se.exerciseId] = total;
            setsMap[se.exerciseId] = matchingSets.map((s: any) => ({ reps: s.reps || 0, weight: s.weight || 0 }));
          } else {
            map[se.exerciseId] = 0;
            setsMap[se.exerciseId] = [];
          }
        }

        setPreviousVolumes(map);
        setPreviousSets(setsMap);
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
        // Auto check-in for the workout's scheduled date
        try {
          if (currentUser?.id && payload.date) {
            const occurredAt = payload.date + 'T12:00:00';
            await checkinApi.addCheckin(currentUser.id, occurredAt);
          }
        } catch (e) {
          // silent — checkin is a convenience side-effect
        }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-2xl font-bold">{id ? 'Edit Workout' : 'Create New Workout'}</h1>
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/dashboard/workouts')}>
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
                <div className="flex flex-col md:flex-row lg:flex-row xl:flex-row gap-2 justify-between items-start mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg text-white">{exercise.exerciseName}</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`flex items-center gap-1.5 shrink-0 ${
                          exercise.exerciseId && loadingSuggestions?.[exercise.exerciseId]
                            ? 'bg-lb-accent/20'
                            : 'border-white/20 text-white hover:bg-white/10'
                        }`}
                        onClick={() => handleAISuggestions(exerciseIndex)}
                      >
                        {exercise.exerciseId && loadingSuggestions?.[exercise.exerciseId] ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            AI Suggest
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400">
                      {exercises.find(e => e.id === exercise.exerciseId)?.description || 'No description available'}
                    </p>
                  </div>
                   {/* Previous + current volume and set details */}
                   <div className="flex flex-col gap-2 w-full">
                     <div className="flex justify-between items-start w-full gap-2">
                       <div className="flex flex-wrap gap-2">
                         <Badge variant="secondary" className="text-xs bg-white/10 text-orange-500">
                           Prev vol: {Number((previousVolumes[exercise.exerciseId] || 0)).toFixed(0)} kg
                         </Badge>
                         <Badge variant="secondary" className="text-xs bg-white/10 text-green-400">
                           Current: {Number(computeCurrentVolume(exercise)).toFixed(0)} kg
                         </Badge>
                       </div>
                       <Button
                         type="button"
                         variant="outline"
                         size="sm"
                         onClick={() => removeExercise(exerciseIndex)}
                         className="border-red-500/50 text-red-400 hover:bg-red-500/20 shrink-0"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                     {/* Previous sets breakdown */}
                     {(previousSets[exercise.exerciseId]?.length ?? 0) > 0 && (
                       <div className="flex flex-wrap gap-1.5 items-center">
                         <span className="text-[10px] text-gray-500 uppercase tracking-wide">Last session:</span>
                         {previousSets[exercise.exerciseId].map((s, i) => (
                           <span key={i} className="text-[11px] bg-white/5 border border-white/10 rounded px-2 py-0.5 text-gray-300">
                             {s.reps}<span className="text-gray-500">r</span> × {s.weight}<span className="text-gray-500">kg</span>
                           </span>
                         ))}
                       </div>
                     )}
                   </div>
                  
                </div>

                <ExerciseVisualizer
                  name={exercise.exerciseName}
                  weight={exercise.sets.reduce((max, s) => Math.max(max, s.weight || 0), 0)}
                />

                {/* Volume history dropdown */}
                {(() => {
                  const history = allWorkoutsHistory
                    .filter(w => (w.sets || []).some((s: any) => s.exercise?.id === exercise.exerciseId && s.weight && s.reps))
                    .map(w => {
                      const sets = (w.sets || []).filter((s: any) => s.exercise?.id === exercise.exerciseId && s.weight && s.reps);
                      return {
                        label: (() => { try { return format(new Date(w.scheduledDate || w.completedDate || Date.now()), 'MMM d'); } catch { return '?'; } })(),
                        volume: sets.reduce((acc: number, s: any) => acc + s.weight * s.reps, 0),
                      };
                    })
                    .slice(-7);
                  const currentVol = computeCurrentVolume(exercise);
                  const prevVol = previousVolumes[exercise.exerciseId] || 0;
                  const diff = currentVol - prevVol;
                  const maxVol = Math.max(...history.map(h => h.volume), currentVol, 1);
                  const isOpen = openHistoryIndex === exerciseIndex;

                  return (
                    <div className="my-4 border-t border-white/10 pt-3">
                      <button
                        type="button"
                        onClick={() => setOpenHistoryIndex(isOpen ? null : exerciseIndex)}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors w-full"
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Volume History</span>
                        {history.length > 0 && <span className="text-gray-600">({history.length} sessions)</span>}
                        <ChevronDown className={`h-3 w-3 ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <div className="mt-2 p-3 bg-lb-dark/60 rounded-lg border border-white/10">
                          {history.length === 0 && currentVol === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-2">No history yet — enter your first sets above!</p>
                          ) : (
                            <>
                              {/* Comparison message */}
                              {prevVol > 0 && currentVol > 0 && (
                                <p className={`text-xs font-medium mb-2 ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                  {diff > 0
                                    ? `↑ +${diff.toFixed(0)} kg vs last session — great progress!`
                                    : diff < 0
                                    ? `↓ ${diff.toFixed(0)} kg vs last session — push harder!`
                                    : '= Same volume as last session — try to beat it!'}
                                </p>
                              )}

                              {/* Stats row */}
                              <div className="flex gap-5 mb-3 text-xs">
                                <div>
                                  <p className="text-gray-500">Last session</p>
                                  <p className="text-white font-semibold">{prevVol > 0 ? `${prevVol.toFixed(0)} kg` : '—'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">This session</p>
                                  <p className={`font-semibold ${currentVol > 0 ? 'text-lb-accent' : 'text-gray-500'}`}>
                                    {currentVol > 0 ? `${currentVol.toFixed(0)} kg` : '0 kg'}
                                  </p>
                                </div>
                              </div>

                              {/* SVG area chart */}
                              {(() => {
                                const pts = [...history.map(h => h.volume), currentVol > 0 ? currentVol : 0];
                                const n = pts.length;
                                const labels = [...history.map(h => h.label), 'Now'];
                                const W = 200, H = 50;
                                const maxV = Math.max(...pts, 1);
                                const coords = pts.map((v, i) => ({
                                  x: n < 2 ? W / 2 : (i / (n - 1)) * W,
                                  y: H - 10 - Math.max(2, (v / maxV) * (H - 16)),
                                }));
                                // Smooth bezier path
                                const lineParts = coords.map((p, i) => {
                                  if (i === 0) return `M ${p.x} ${p.y}`;
                                  const prev = coords[i - 1];
                                  const cx = (prev.x + p.x) / 2;
                                  return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`;
                                });
                                const lineD = lineParts.join(' ');
                                const areaD = `${lineD} L ${coords[n-1].x} ${H} L ${coords[0].x} ${H} Z`;
                                const gradId = `area-grad-${exercise.exerciseId.replace(/[^a-z0-9]/gi, '')}`;
                                return (
                                  <div>
                                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 60 }} preserveAspectRatio="none">
                                      <defs>
                                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor="rgb(249,115,22)" stopOpacity="0.35" />
                                          <stop offset="100%" stopColor="rgb(249,115,22)" stopOpacity="0.02" />
                                        </linearGradient>
                                      </defs>
                                      {/* Area fill */}
                                      <path d={areaD} fill={`url(#${gradId})`} />
                                      {/* Line */}
                                      <path d={lineD} fill="none" stroke="rgb(249,115,22)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      {/* Data points */}
                                      {coords.map((p, i) => (
                                        <circle
                                          key={i}
                                          cx={p.x}
                                          cy={p.y}
                                          r={i === n - 1 ? 3.5 : 2.5}
                                          fill={i === n - 1 ? 'rgb(249,115,22)' : 'rgba(249,115,22,0.55)'}
                                          stroke={i === n - 1 ? 'rgba(249,115,22,0.4)' : 'none'}
                                          strokeWidth={i === n - 1 ? 4 : 0}
                                        />
                                      ))}
                                    </svg>
                                    {/* X-axis labels */}
                                    <div className="flex mt-0.5">
                                      {labels.map((lbl, i) => (
                                        <div
                                          key={i}
                                          className="flex-1 text-center"
                                          style={{ fontSize: 8, color: i === n - 1 ? 'rgb(249,115,22)' : 'rgba(156,163,175,0.7)' }}
                                        >
                                          {lbl}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

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
                            value={set.reps === 0 ? '' : set.reps}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)}
                            className="w-20 bg-lb-dark border-white/20 text-white"
                            min="1"
                          />
                          <span className="text-sm text-gray-400">reps</span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => incrementSetValue(exerciseIndex, setIndex, 'reps', 2)}
                              className="h-7 px-2 border-green-800 text-green-400"
                            >
                              +2
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => incrementSetValue(exerciseIndex, setIndex, 'reps', 5)}
                              className="h-7 px-2 border-green-800 text-green-400 "
                            >
                              +5
                            </Button>
                          </div>
                          <ArrowUp height={20} width={20} color="green"/>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                              type="number"
                            placeholder="Weight"
                            value={set.weight === 0 ? '' : set.weight}
                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                            className="w-20 bg-lb-dark border-white/20 text-white"
                            min="0"
                              step="0.5"
                          />
                          <span className="text-sm text-gray-400">kg</span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => incrementSetValue(exerciseIndex, setIndex, 'weight', 2.5)}
                              className="h-7 px-2 border-green-800 text-green-400"
                            >
                              +2.5
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => incrementSetValue(exerciseIndex, setIndex, 'weight', 5)}
                              className="h-7 px-2 border-green-800 text-green-400"
                            >
                              +5
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => incrementSetValue(exerciseIndex, setIndex, 'weight', 10)}
                              className="h-7 px-2 border-green-800 text-green-400"
                            >
                              +10
                            </Button>
                          </div>
                          <ArrowUp height={20} width={20} color="green"/>
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

            <div className="mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-gray-300 mb-1">Filter by muscle group</div>
                  <Select
                    value={selectedMuscleGroup}
                    onValueChange={(val) => {
                      setSelectedMuscleGroup(val);
                      fetchExercises(val === 'all' ? undefined : val);
                    }}
                  >
                    <SelectTrigger className="bg-lb-darker border-white/10 text-white">
                      <SelectValue placeholder="All muscle groups" />
                    </SelectTrigger>
                    <SelectContent className="bg-lb-card border-white/10">
                      <SelectItem value="all" className="text-white hover:bg-lb-darker">All</SelectItem>
                      {muscleGroups.map((mg) => (
                        <SelectItem key={mg.id} value={mg.id} className="text-white hover:bg-lb-darker">
                          {mg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="text-sm text-gray-300 mb-1">Search exercises</div>
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
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Array.isArray((exercise as any).muscleGroups) && (exercise as any).muscleGroups[0] && (
                          <Badge variant="secondary" className="text-xs bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
                            Primary: {(exercise as any).muscleGroups[0].name}
                          </Badge>
                        )}
                        {Array.isArray((exercise as any).muscleGroups) && (exercise as any).muscleGroups[1] && (
                          <Badge variant="secondary" className="text-xs bg-blue-600/20 text-blue-300 border-blue-500/30">
                            Secondary: {(exercise as any).muscleGroups[1].name}
                          </Badge>
                        )}
                      </div>
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
