import axios from 'axios';

// const API_URL = 'http://107.21.176.88:8080/api/auth';
// const API_URL = 'http://13.217.88.71:8080/api/auth'; 
const API_URL = 'https://gym-management-latest.onrender.com/api/auth';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials to handle CORS cookies if needed
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
      if (error.response.status === 401 || error.response.status === 403) {
        // Clear token on authentication errors
        localStorage.removeItem('token');
      }
      
      // Use the server's error message if available
      if (error.response.data && error.response.data.message) {
        throw { message: error.response.data.message, ...error.response.data };
      }
      
      // Fallback error message based on status code
      const errorMessages: { [key: number]: string } = {
        400: 'Invalid request. Please check your input.',
        401: 'Unauthorized. Please log in again.',
        403: 'Access denied. You do not have permission to perform this action.',
        404: 'Resource not found.',
        500: 'Internal server error. Please try again later.',
      };
      
      throw { 
        message: errorMessages[error.response.status] || 'An unexpected error occurred',
        status: error.response.status 
      };
    } else if (error.request) {
      // The request was made but no response was received
      throw { message: 'No response from server. Please check your internet connection and try again.' };
    } else {
      // Something happened in setting up the request that triggered an Error
      throw { message: error.message || 'An unexpected error occurred' };
    }
  }
);

export interface SignupData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'ADMIN' | 'TRAINER' | 'MEMBER';
  heightCm?: number;
  weightKg?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'PROFESSIONAL';
}

export interface SigninData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  message?: string;
  note?: string;
}

const authService = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    try {
      // Validate required fields
      const requiredFields = ['username', 'email', 'password', 'role'] as const;
      for (const field of requiredFields) {
        if (!data[field]) {
          throw { message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` };
        }
      }

      const response = await axiosInstance.post('/signup', data);
      return response.data;
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // If we have a structured error message, use it
      if (error.message) {
        throw error;
      }
      
      // Otherwise, create a generic error message
      throw { message: 'An error occurred during sign up. Please try again.' };
    }
  },

  signin: async (data: SigninData): Promise<AuthResponse> => {
    try {
      // Validate required fields
      if (!data.username || !data.password) {
        throw { message: 'Username and password are required' };
      }

      const response = await axios({
        method: 'post',
        url: `${API_URL}/signin`,
        data: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      
      const responseData = response.data as AuthResponse;
      
      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
      }
      
      return responseData;
    } catch (error: any) {
      console.error('Signin error:', error);
      
      // If we have a response from the server, use that message
      if (error.response?.data?.message) {
        throw error.response.data;
      }
      
      // Otherwise, create a generic error message
      throw { 
        message: error.message || 'An error occurred during sign in. Please try again.' 
      };
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
  },

  getCurrentToken: (): string | null => {
    return localStorage.getItem('token');
  },

  isLoggedIn: (): boolean => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Basic JWT expiration check (this is a simple check, you might want to add more validation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      return false;
    }
  }
};

export default authService;
