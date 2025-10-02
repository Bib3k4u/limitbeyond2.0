import { axiosInstance } from './axiosInstance';
import BASE_URL from './config';

export const aiWorkoutApi = {
  getSuggestions: (exerciseId: string, historyDays: number = 30) =>
    axiosInstance.get(`/ai-workout/suggest/${exerciseId}`, { params: { historyDays } }),

  getWeeklySuggestions: () =>
    axiosInstance.get('/ai-workout/weekly-suggestions'),

  getProgressiveOverload: (exerciseId: string) =>
    axiosInstance.get(`/ai-workout/progressive-overload/${exerciseId}`),
};