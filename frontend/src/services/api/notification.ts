import { axiosInstance } from './axiosInstance';

export interface WorkoutSuggestion {
  id: string;
  message: string;
  createdAt: string;
  data: Record<string, any>;
}

export const notificationApi = {
  getWorkoutSuggestions: () =>
    axiosInstance.get<WorkoutSuggestion[]>('/notifications/workout-suggestions'),

  markSuggestionAsSeen: (id: string) =>
    axiosInstance.post(`/notifications/suggestions/${id}/seen`),
};