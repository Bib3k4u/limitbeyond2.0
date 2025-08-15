import { axiosInstance } from './axiosInstance';
import { Workout, WorkoutRequest } from '@/types/workout';
import cache from '@/services/cache';

export const workoutApi = {
  getAll: async (memberId?: string) => {
    const key = memberId ? `workouts:member:${memberId}` : `workouts:all`;
    const cached = cache.get(key);
    if (cached) return { data: cached } as any;
    // If memberId provided, pass as query param so backend can return that member's workouts
    const config = memberId ? { params: { memberId } } : undefined;
    const resp = await axiosInstance.get<Workout[]>('/workouts', config);
    cache.set(key, resp.data, 2 * 60 * 1000); // cache 2 minutes
    return resp;
  },

  getById: async (id: string) => {
    const key = `workout:${id}`;
    const cached = cache.get(key);
    if (cached) return { data: cached } as any;
    const resp = await axiosInstance.get<Workout>(`/workouts/${id}`);
    cache.set(key, resp.data, 2 * 60 * 1000);
    return resp;
  },

  create: async (workout: WorkoutRequest) => {
    const resp = await axiosInstance.post<Workout>('/workouts', workout);
    // new data -> clear relevant caches
    cache.clear('workouts:');
    return resp;
  },

  update: async (id: string, workout: WorkoutRequest) => {
    const resp = await axiosInstance.put<Workout>(`/workouts/${id}`, workout);
    cache.del(`workout:${id}`);
    cache.clear('workouts:');
    return resp;
  },

  delete: async (id: string) => {
    const resp = await axiosInstance.delete(`/workouts/${id}`);
    cache.del(`workout:${id}`);
    cache.clear('workouts:');
    return resp;
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    // Backend expects ISO date (yyyy-MM-dd) as LocalDate; normalize in case caller passed full ISO timestamps
    const normalize = (d: string) => {
      if (!d) return d;
      // If contains 'T' (full ISO), take date part before 'T'
      if (d.includes('T')) return d.split('T')[0];
      // If already in yyyy-MM-dd, return as-is
      return d;
    };
    const s = normalize(startDate);
    const e = normalize(endDate);
    const key = `workouts:daterange:${s}:${e}`;
    const cached = cache.get(key);
    if (cached) return { data: cached } as any;
    const resp = await axiosInstance.get<Workout[]>(`/workouts/by-date-range?startDate=${s}&endDate=${e}`);
    cache.set(key, resp.data, 2 * 60 * 1000);
    return resp;
  },

  getByMuscleGroup: async (muscleGroupId: string) => {
    const key = `workouts:mg:${muscleGroupId}`;
    const cached = cache.get(key);
    if (cached) return { data: cached } as any;
    const resp = await axiosInstance.get<Workout[]>(`/workouts/by-muscle-group/${muscleGroupId}`);
    cache.set(key, resp.data, 2 * 60 * 1000);
    return resp;
  },

  // Allow manual cache invalidation from other parts of the app
  clearCache: () => {
    cache.clear('workouts:');
    // also clear individual workout entries
    // Note: cache.clear with prefix will already clear keys starting with workouts:
  }

,

  completeSet: (workoutId: string, setId: string) => {
    return axiosInstance.post(`/workouts/${workoutId}/sets/${setId}/complete`);
  },

  uncompleteSet: (workoutId: string, setId: string) => {
    return axiosInstance.post(`/workouts/${workoutId}/sets/${setId}/uncomplete`);
  },

  completeWorkout: (workoutId: string) => {
    return axiosInstance.post(`/workouts/${workoutId}/complete`);
  },

  copyWorkout: (workoutId: string, newDate: string) => {
    // newDate should be yyyy-MM-dd for backend
    return axiosInstance.post<Workout>(`/workouts/${workoutId}/copy?newDate=${newDate}`);
  }
};
