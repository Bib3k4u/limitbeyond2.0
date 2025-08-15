export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  days: WorkoutTemplateDay[];
}

export interface WorkoutTemplateDay {
  day: number;
  name: string;
  focus: string;
  exercises: WorkoutTemplateExercise[];
}

export interface WorkoutTemplateExercise {
  exerciseName: string; // Use name instead of ID for matching
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'ppl-6day',
    name: 'Push / Pull / Legs - 6 Day Split (PPL x2)',
    description: 'Six-day split: Push / Pull / Legs repeated with different accessory exercises',
    days: [
      {
        day: 1,
        name: 'Push - Heavy',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { exerciseName: 'Bench Press', sets: 4, reps: 6, notes: 'Heavy compound for chest' },
          { exerciseName: 'Incline Bench Press', sets: 3, reps: 8, notes: 'Upper chest focus' },
          { exerciseName: 'Overhead Press', sets: 3, reps: 6, notes: 'Standing press for shoulders' },
          { exerciseName: 'Lateral Raise', sets: 3, reps: 12, notes: 'Shoulder isolation' },
          { exerciseName: 'Triceps Pushdown', sets: 3, reps: 10, notes: 'Triceps finish' }
        ]
      },
      {
        day: 2,
        name: 'Pull - Heavy',
        focus: 'Back, Biceps, Forearms',
        exercises: [
          { exerciseName: 'Deadlift', sets: 3, reps: 5, notes: 'Posterior chain heavy lift' },
          { exerciseName: 'Barbell Row', sets: 4, reps: 8, notes: 'Horizontal pulling' },
          { exerciseName: 'Pull-Up', sets: 3, reps: 6, notes: 'Vertical pulling bodyweight' },
          { exerciseName: 'Barbell Curl', sets: 3, reps: 10, notes: 'Biceps' },
          { exerciseName: 'Hammer Curl', sets: 3, reps: 10, notes: 'Biceps/forearm' }
        ]
      },
      {
        day: 3,
        name: 'Legs - Heavy',
        focus: 'Quads, Hamstrings, Glutes',
        exercises: [
          { exerciseName: 'Squat', sets: 4, reps: 6, notes: 'Back squat or variation' },
          { exerciseName: 'Romanian Deadlift', sets: 3, reps: 8, notes: 'Hamstrings/glutes' },
          { exerciseName: 'Leg Press', sets: 3, reps: 10, notes: 'Quad accessory' },
          { exerciseName: 'Leg Curl', sets: 3, reps: 12, notes: 'Hamstring isolation' },
          { exerciseName: 'Leg Extension', sets: 3, reps: 12, notes: 'Quad isolation' }
        ]
      },
      {
        day: 4,
        name: 'Push - Volume',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { exerciseName: 'Dumbbell Fly', sets: 3, reps: 12, notes: 'Chest isolation' },
          { exerciseName: 'Push-Up', sets: 3, reps: 15, notes: 'Bodyweight, high reps' },
          { exerciseName: 'Arnold Press', sets: 3, reps: 10, notes: 'Shoulder variation' },
          { exerciseName: 'Front Raise', sets: 3, reps: 12, notes: 'Anterior deltoid' },
          { exerciseName: 'Close-Grip Bench Press', sets: 3, reps: 8, notes: 'Triceps emphasis' }
        ]
      },
      {
        day: 5,
        name: 'Pull - Volume',
        focus: 'Back, Biceps, Forearms',
        exercises: [
          { exerciseName: 'Lat Pulldown', sets: 4, reps: 10, notes: 'Vertical pulling' },
          { exerciseName: 'Face Pull', sets: 3, reps: 15, notes: 'Rear delts/upper back' },
          { exerciseName: 'Barbell Row', sets: 3, reps: 10, notes: 'Horizontal pulling' },
          { exerciseName: 'Dumbbell Curl', sets: 3, reps: 12, notes: 'Biceps' },
          { exerciseName: 'Preacher Curl', sets: 3, reps: 10, notes: 'Biceps isolation' }
        ]
      },
      {
        day: 6,
        name: 'Legs - Volume',
        focus: 'Quads, Hamstrings, Glutes',
        exercises: [
          { exerciseName: 'Leg Press', sets: 4, reps: 12, notes: 'Quad volume work' },
          { exerciseName: 'Leg Extension', sets: 3, reps: 15, notes: 'Quad isolation' },
          { exerciseName: 'Romanian Deadlift', sets: 3, reps: 10, notes: 'Hamstring focus' },
          { exerciseName: 'Squat', sets: 3, reps: 10, notes: 'Lighter squat variation' },
          { exerciseName: 'Leg Curl', sets: 3, reps: 12, notes: 'Hamstring isolation' }
        ]
      }
    ]
  },
  {
    id: 'basic-strength-3day',
    name: 'Basic Strength 3-Day Split',
    description: 'Simple 3-day split focusing on fundamental compound movements',
    days: [
      {
        day: 1,
        name: 'Push Day',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
          { exerciseName: 'Push-ups', sets: 3, reps: 10, weight: 0, notes: 'Bodyweight, focus on form' },
          { exerciseName: 'Dips', sets: 3, reps: 8, weight: 0, notes: 'Bodyweight or assisted' },
          { exerciseName: 'Planks', sets: 3, reps: 1, weight: 0, notes: 'Hold for 30-60 seconds' }
        ]
      },
      {
        day: 2,
        name: 'Pull Day',
        focus: 'Back, Biceps',
        exercises: [
          { exerciseName: 'Pull-ups', sets: 3, reps: 5, weight: 0, notes: 'Bodyweight or assisted' },
          { exerciseName: 'Rows', sets: 3, reps: 10, weight: 0, notes: 'Use resistance bands or bodyweight' },
          { exerciseName: 'Superman', sets: 3, reps: 10, weight: 0, notes: 'Bodyweight back exercise' }
        ]
      },
      {
        day: 3,
        name: 'Legs Day',
        focus: 'Quads, Hamstrings, Glutes',
        exercises: [
          { exerciseName: 'Squats', sets: 3, reps: 12, weight: 0, notes: 'Bodyweight, focus on depth' },
          { exerciseName: 'Lunges', sets: 3, reps: 10, weight: 0, notes: 'Alternating legs' },
          { exerciseName: 'Calf Raises', sets: 3, reps: 15, weight: 0, notes: 'Bodyweight, full range of motion' }
        ]
      }
    ]
  },
  {
    id: 'full-body-3day',
    name: 'Full Body 3-Day Split',
    description: 'Full body workouts for overall strength and conditioning',
    days: [
      {
        day: 1,
        name: 'Full Body A',
        focus: 'Compound movements, upper body focus',
        exercises: [
          { exerciseName: 'Push-ups', sets: 3, reps: 8, weight: 0, notes: 'Full range of motion' },
          { exerciseName: 'Squats', sets: 3, reps: 15, weight: 0, notes: 'Bodyweight, good form' },
          { exerciseName: 'Planks', sets: 3, reps: 1, weight: 0, notes: 'Hold for 45 seconds' },
          { exerciseName: 'Mountain Climbers', sets: 3, reps: 20, weight: 0, notes: 'Alternating legs' }
        ]
      },
      {
        day: 2,
        name: 'Full Body B',
        focus: 'Compound movements, lower body focus',
        exercises: [
          { exerciseName: 'Lunges', sets: 3, reps: 12, weight: 0, notes: 'Alternating legs, good form' },
          { exerciseName: 'Dips', sets: 3, reps: 6, weight: 0, notes: 'Bodyweight or assisted' },
          { exerciseName: 'Glute Bridges', sets: 3, reps: 15, weight: 0, notes: 'Focus on glute activation' },
          { exerciseName: 'Burpees', sets: 3, reps: 8, weight: 0, notes: 'Full movement, controlled pace' }
        ]
      },
      {
        day: 3,
        name: 'Full Body C',
        focus: 'Core and stability',
        exercises: [
          { exerciseName: 'Planks', sets: 3, reps: 1, weight: 0, notes: 'Hold for 60 seconds' },
          { exerciseName: 'Side Planks', sets: 3, reps: 1, weight: 0, notes: '30 seconds each side' },
          { exerciseName: 'Bird Dogs', sets: 3, reps: 10, weight: 0, notes: 'Alternating arm and leg' },
          { exerciseName: 'Dead Bugs', sets: 3, reps: 12, weight: 0, notes: 'Controlled movement' }
        ]
      }
    ]
  }
];

export const getTemplateById = (id: string): WorkoutTemplate | undefined => {
  return workoutTemplates.find(template => template.id === id);
};

export const getAllTemplates = (): WorkoutTemplate[] => {
  return workoutTemplates;
}; 