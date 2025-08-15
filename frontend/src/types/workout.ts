export interface Workout {
  id: string;
  name: string;
  description?: string;
  scheduledDate: string;
  completed: boolean;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSet {
  id: string;
  exercise: {
    id: string;
    name: string;
    description?: string;
  };
  reps: number;
  weight?: number;
  completed: boolean;
  notes?: string;
}

export interface WorkoutRequest {
  name: string;
  description?: string;
  memberId?: string;
  trainerId?: string;
  date?: string; // yyyy-MM-dd convenience
  scheduledDate?: string; // ISO date-time
  targetMuscleGroupIds?: string[];
  notes?: string;
  sets: WorkoutSetRequest[];
}

export interface WorkoutSetRequest {
  exerciseId: string;
  reps: number;
  weight?: number;
  notes?: string;
}

export interface WorkoutResponse extends Workout {
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}
