import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Copy, ChevronLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { workoutApi } from '@/services/api/workoutApi';
import { exerciseTemplatesApi } from '@/services/api/exerciseTemplatesApi';
import { workoutTemplates, WorkoutTemplate } from '@/data/workoutTemplates';
import userService from '@/services/api/userService';

const WorkoutTemplates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [copying, setCopying] = useState(false);
  const [exercises, setExercises] = useState<any[]>([]);

  // Fetch exercises on component mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await exerciseTemplatesApi.getAll();
        if (response?.data) {
          setExercises(response.data);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        toast({
          title: 'Error',
          description: 'Failed to load exercises. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchExercises();
  }, [toast]);

  const handleCopyTemplate = async () => {
    if (!selectedTemplate || !selectedDay || !selectedDate) return;
    
    setCopying(true);
    try {
      const day = selectedTemplate.days.find(d => d.day === selectedDay);
      if (!day) throw new Error('Day not found');

      // Get current user profile
      const profile = await userService.getCurrentUserProfile();
      if (!profile) throw new Error('User profile not found');

      // Find exercises by name and create workout sets
      const workoutSets = [];
      const missingExercises = [];
      
      // Helper: normalize names (lowercase, trim, remove punctuation)
      const normalize = (s: any) => (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

      // Small Levenshtein distance implementation for fuzzy matching
      const levenshtein = (a: string, b: string) => {
        const al = a.length, bl = b.length;
        if (al === 0) return bl;
        if (bl === 0) return al;
        const matrix = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
        for (let i = 0; i <= al; i++) matrix[i][0] = i;
        for (let j = 0; j <= bl; j++) matrix[0][j] = j;
        for (let i = 1; i <= al; i++) {
          for (let j = 1; j <= bl; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + cost
            );
          }
        }
        return matrix[al][bl];
      };

      for (const templateExercise of day.exercises) {
        const rawTarget = templateExercise.exerciseName || '';
        const target = normalize(rawTarget);

        // 1) exact normalized match
        let foundExercise = exercises.find(ex => normalize(ex.name) === target);

        // 2) substring match (exercise name contains target or vice versa)
        if (!foundExercise) {
          foundExercise = exercises.find(ex => normalize(ex.name).includes(target) || target.includes(normalize(ex.name)));
        }

        // 3) fuzzy match via Levenshtein distance with threshold (25% of length or min 2)
        if (!foundExercise) {
          let best: any = null;
          let bestDist = Infinity;
          for (const ex of exercises) {
            const exName = normalize(ex.name);
            const dist = levenshtein(exName, target);
            if (dist < bestDist) {
              bestDist = dist;
              best = ex;
            }
          }
          const maxAllowed = Math.max(2, Math.floor(Math.max(target.length, 1) * 0.25));
          if (best && bestDist <= maxAllowed) {
            console.debug(`Fuzzy matched '${rawTarget}' -> '${best.name}' (dist=${bestDist})`);
            foundExercise = best;
          }
        }

        if (!foundExercise) {
          console.warn(`Exercise not found: ${templateExercise.exerciseName}`);
          missingExercises.push(templateExercise.exerciseName);
          // Skip this exercise and continue with others
          continue;
        }

        // Create multiple sets for this exercise
        for (let i = 0; i < templateExercise.sets; i++) {
          workoutSets.push({
            exerciseId: foundExercise.id,
            reps: templateExercise.reps,
            weight: templateExercise.weight,
            notes: templateExercise.notes
          });
        }
      }

      if (workoutSets.length === 0) {
        throw new Error('No valid exercises found in template. Please check if exercises exist in your database.');
      }

      // Create workout from template
      const workoutData = {
        name: `${day.name} - ${selectedTemplate.name}`,
        description: `Template: ${selectedTemplate.description}\nFocus: ${day.focus}`,
        memberId: profile.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        sets: workoutSets
      };

      await workoutApi.create(workoutData);
      
      // Show success message with information about missing exercises
      let successMessage = `Workout "${day.name}" copied successfully with ${workoutSets.length} sets!`;
      if (missingExercises.length > 0) {
        successMessage += `\n\nNote: ${missingExercises.length} exercise(s) were skipped because they weren't found in your database: ${missingExercises.join(', ')}`;
      }
      
      toast({
        title: 'Success',
        description: successMessage,
      });
      
      setShowCopyDialog(false);
      navigate('/dashboard/workouts');
    } catch (error: any) {
      console.error('Error copying template:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to copy workout template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCopying(false);
    }
  };

  const openCopyDialog = (template: WorkoutTemplate, day: number) => {
    setSelectedTemplate(template);
    setSelectedDay(day);
    setShowCopyDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard/workouts')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Workout Templates</h1>
          <p className="text-muted-foreground">Use prebuilt workout plans to get started quickly</p>
        </div>
      </div>

      <div className="grid gap-6">
        {workoutTemplates.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{template.name}</h2>
              <p className="text-muted-foreground">{template.description}</p>
            </div>

            <div className="grid gap-4">
              {template.days.map((day) => (
                <div key={day.day} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">Day {day.day}: {day.name}</h3>
                      <p className="text-sm text-muted-foreground">{day.focus}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openCopyDialog(template, day.day)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Day
                    </Button>
                  </div>

                  <div className="grid gap-2">
                    {day.exercises.map((exercise, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{exercise.exerciseName}</span>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{exercise.sets} sets</span>
                          <span>{exercise.reps} reps</span>
                          {exercise.weight !== undefined && exercise.weight > 0 && (
                            <span>{exercise.weight}kg</span>
                          )}
                          {exercise.weight === 0 && <span>Bodyweight</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Workout Template</DialogTitle>
            <DialogDescription>
              Select a date for your new workout. The template will be copied with all exercises and sets.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <h4 className="font-medium mb-2">
                {selectedTemplate?.name} - Day {selectedDay}: {selectedTemplate?.days.find(d => d.day === selectedDay)?.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate?.days.find(d => d.day === selectedDay)?.focus}
              </p>
            </div>
            
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCopyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCopyTemplate} disabled={copying || !selectedDate}>
              {copying ? 'Copying...' : 'Copy Workout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutTemplates; 