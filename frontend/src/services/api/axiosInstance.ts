import axios from 'axios';

const API_URL = 'http://localhost:8080/api';
// const API_URL = 'http://13.217.88.71:8080/api'; 

// const API_URL = 'https://gym-management-v0n4.onrender.com/api';


// Create an axios instance with common configuration
export const axiosInstance = axios.create({
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