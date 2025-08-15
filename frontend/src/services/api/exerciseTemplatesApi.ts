import { axiosInstance } from './axiosInstance';
import cache from '@/services/cache';

export const exerciseTemplatesApi = {
  getAll: async () => {
    const key = 'exercises:all';
    const cached = cache.get(key);
    if (cached) return { data: cached } as any;
    const token = localStorage.getItem('token');
    // If no token, call public endpoint directly (avoid auth failure roundtrip)
    if (!token) {
      const resp = await axiosInstance.get('/exercise-templates/public');
      cache.set(key, resp.data, 10 * 60 * 1000);
      return resp;
    }
    try {
      // Authenticated call when token present
      const resp = await axiosInstance.get('/exercise-templates');
      cache.set(key, resp.data, 10 * 60 * 1000);
      return resp;
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        // Fallback to public endpoint if authentication fails
        const resp = await axiosInstance.get('/exercise-templates/public');
        cache.set(key, resp.data, 10 * 60 * 1000);
        return resp;
      }
      throw error;
    }
  },

  getById: (id: string) => {
  const key = `exercise:${id}`;
  const cached = cache.get(key);
  if (cached) return { data: cached } as any;
  return axiosInstance.get(`/exercise-templates/${id}`).then(r => { cache.set(key, r.data, 10 * 60 * 1000); return r; });
  },

  create: (exerciseTemplate: any) => {
  const resp = axiosInstance.post('/exercise-templates', exerciseTemplate);
  // clear exercises cache
  cache.clear('exercises:');
  return resp;
  },

  update: (id: string, exerciseTemplate: any) => {
  const resp = axiosInstance.put(`/exercise-templates/${id}`, exerciseTemplate);
  cache.del(`exercise:${id}`);
  cache.clear('exercises:');
  return resp;
  },

  delete: (id: string) => {
  const resp = axiosInstance.delete(`/exercise-templates/${id}`);
  cache.del(`exercise:${id}`);
  cache.clear('exercises:');
  return resp;
  },

  bulkCreate: (exerciseTemplates: any[]) => {
  const resp = axiosInstance.post('/exercise-templates/bulk', exerciseTemplates);
  cache.clear('exercises:');
  return resp;
  },

  getByMuscleGroup: (muscleGroupId: string) => {
  const key = `exercises:mg:${muscleGroupId}`;
  const cached = cache.get(key);
  if (cached) return { data: cached } as any;
  return axiosInstance.get(`/exercise-templates/by-muscle-group/${muscleGroupId}`).then(r => { cache.set(key, r.data, 2 * 60 * 1000); return r; });
  }
}; 