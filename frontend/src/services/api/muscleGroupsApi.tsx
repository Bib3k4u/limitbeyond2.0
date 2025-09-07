import axios from 'axios';
import cache from '@/services/cache';

const API_URL = 'http://localhost:8080/api'; // Adjust the base URL as needed
// const API_URL = 'http://13.217.88.71:8080/api'; 

// const API_URL = 'https://gym-management-v0n4.onrender.com/api';


// Create an axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response); // Log successful responses
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error statuses
      if (error.response.status === 401) {
        console.log('Unauthorized. Redirecting to login...');
        localStorage.removeItem('token');
        window.location.href = '/auth/signin';
      }
      console.error('Error Response:', error.response); // Log error response
      throw error.response.data;
    } else if (error.request) {
      console.error('No response from server:', error.request);
      throw { message: 'No response from server. Please try again.' };
    } else {
      console.error('Error message:', error.message);
      throw { message: error.message };
    }
  }
);
export const muscleGroupsApi = {
  getAll: async () => {
    const fallbackMuscleGroups = [
      { id: "chest", name: "Chest" },
      { id: "back", name: "Back" },
      { id: "legs", name: "Legs" },
      { id: "shoulders", name: "Shoulders" },
      { id: "arms", name: "Arms" },
      { id: "biceps", name: "Biceps" },
      { id: "triceps", name: "Triceps" },
      { id: "core", name: "Core" },
      { id: "abs", name: "Abs" },
      { id: "cardio", name: "Cardio" }
    ];

    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
  const key = 'muscleGroups:all';
  const cached = cache.get(key);
  if (cached) return { data: cached } as any;
  const response = await axiosInstance.get('/muscle-groups/public', config);
      
      if (response.data.length === 0) {
        console.warn('No muscle groups found in API response.');
      }

  console.log('Received muscle groups:', response.data);
  // cache result 10 minutes
  cache.set(key, response.data, 10 * 60 * 1000);
  return response;
    } catch (error) {
      console.warn("API call for muscle groups failed, using fallback data", error);

      return {
        data: fallbackMuscleGroups,
        status: 200,
        statusText: "OK (Fallback)",
        headers: {},
        config: {},
        usingMock: true
      };
    }
  },

  getById: (id: string) => {
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    
    console.log(`Making API request for muscle group with id: ${id}`);
    const key = `muscleGroups:${id}`;
    const cached = cache.get(key);
    if (cached) return { data: cached } as any;
    return axiosInstance.get(`/muscle-groups/public/${id}`, config)
      .then(response => { cache.set(key, response.data, 10 * 60 * 1000); return response; })
      .catch(error => { console.error(`Error fetching muscle group with id ${id}:`, error); throw error; });
  },
};
