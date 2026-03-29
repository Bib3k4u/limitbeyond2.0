import axios from 'axios';
import API_BASE_URL from './config';

const API_URL = `${API_BASE_URL}/users`;


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
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/auth/signin';
      }
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      throw { message: 'No response from server. Please try again.' };
    } else {
      // Something happened in setting up the request that triggered an Error
      throw { message: error.message };
    }
  }
);

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  active: boolean;
  assignedTrainer?: string;
  assignedMembers?: string[];
  heightCm?: number;
  currentWeightKg?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'PROFESSIONAL' | string;
  weightHistory?: Array<{ timestamp: number; weightKg: number }>;
}

export interface AssignTrainerRequest {
  trainerId: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  heightCm?: number;
  weightKg?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'PROFESSIONAL';
}

export const userService = {
  // Get current user's profile
  getCurrentUserProfile: async (): Promise<UserProfile> => {
    try {
      const response = await axiosInstance.get('/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Get all trainers (Admin only)
  getAllTrainers: async (page: number = 0, size: number = 100): Promise<UserProfile[]> => {
    try {
      const response = await axiosInstance.get('/trainers', { params: { page, size } });
      return response.data;
    } catch (error) {
      console.error('Error fetching trainers:', error);
      throw error;
    }
  },

  // Get all members (Admin/Trainer)
  getAllMembers: async (page: number = 0, size: number = 100): Promise<UserProfile[]> => {
    try {
      const response = await axiosInstance.get('/members', { params: { page, size } });
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  // Fetch all member pages (for dropdowns that need the full list)
  getAllMembersPages: async (pageSize: number = 100): Promise<UserProfile[]> => {
    const all: UserProfile[] = [];
    let page = 0;
    while (true) {
      try {
        const batch = await userService.getAllMembers(page, pageSize);
        all.push(...batch);
        if (batch.length < pageSize) break;
        page++;
      } catch {
        break;
      }
    }
    return all;
  },

  // Activate user (Admin only)
  activateUser: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put(`/${userId}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  },

  // Deactivate user (Admin only)
  deactivateUser: async (userId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put(`/${userId}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  // Assign trainer to member (Admin only)
  assignTrainerToMember: async (memberId: string, trainerId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put(`/member/${memberId}/assign-trainer`, { trainerId });
      return response.data;
    } catch (error) {
      console.error('Error assigning trainer:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId: string, data: UpdateProfileRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put(`/profile`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Update password
  updatePassword: async (newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put('/password', { newPassword });
      return response.data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await axiosInstance.get(`/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }
};

export default userService;
