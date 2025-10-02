import axios from 'axios';

// const API_URL = 'http://107.21.176.88:8080/api'; // Adjust the base URL as needed
// const API_URL = 'http://13.217.88.71:8080/api';
// const API_URL = 'http://localhost:8080/api';  

const API_URL = 'https://limitbeyond2-0.onrender.com/api';


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
      // Handle specific error statuses
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/auth/signin';
      }
      throw error.response.data;
    } else if (error.request) {
      throw { message: 'No response from server. Please try again.' };
    } else {
      throw { message: error.message };
    }
  }
);

export const exerciseTemplatesApi = {
  getAll: async () => {
  const token = localStorage.getItem('token');
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  try {
    // First try the authenticated endpoint
    let response = await axiosInstance.get('/exercise-templates', config);
    return response;
  } catch (authError) {
    console.log('Authenticated endpoint failed, trying public endpoint');

    try {
      // Fall back to public endpoint
      let response = await axiosInstance.get('/exercise-templates/public', config);
      return response;
    } catch (publicError) {
      console.error('Public endpoint failed:', publicError);

      // Return a more meaningful error message to the client
      throw {
        message: 'An error occurred while retrieving exercise templates. Please try again later.',
        status: 500
      };
    }
  }
},

  getPublic: () => {
    return axiosInstance.get('/exercise-templates/public');
  },

  getById: (id: string) => {
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    return axiosInstance.get(`/exercise-templates/${id}`, config)
      .catch(() => axiosInstance.get(`/exercise-templates/public/${id}`, config));
  },

  getByMuscleGroup: (muscleGroupId: string) => {
    const token = localStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    return axiosInstance.get(`/exercise-templates/by-muscle-group/${muscleGroupId}`, config)
      .catch(() => axiosInstance.get(`/exercise-templates/public/by-muscle-group/${muscleGroupId}`, config));
  },
};
