import axios from 'axios';

// const API_URL = 'http://localhost:8080/api/feedback';
const API_URL = 'https://limitbeyond2-0.onrender.com/api/feedback';


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

export interface FeedbackResponse {
  responderId: string;
  content: string;
  responseTime: string;
}

export interface Feedback {
  id: string;
  memberId: string;
  title: string;
  content: string;
  createdAt: string;
  responses: FeedbackResponse[];
}

export interface CreateFeedbackRequest {
  title: string;
  content: string;
}

export interface FeedbackResponseRequest {
  content: string;
}

const handleError = (error: any, context: string) => {
  console.error(`Error ${context}:`, error);
  if (error.message) {
    throw error;
  } else {
    throw { message: `Failed to ${context}. Please try again.` };
  }
};

const feedbackService = {
  // Create new feedback (Member only)
  createFeedback: async (data: CreateFeedbackRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post('', data);
      return response.data;
    } catch (error) {
      handleError(error, 'create feedback');
    }
  },

  // Get all feedback
  getAllFeedback: async (): Promise<Feedback[]> => {
    try {
      const response = await axiosInstance.get('');
      return response.data;
    } catch (error) {
      handleError(error, 'fetch feedback');
    }
  },

  // Get feedback by ID
  getFeedbackById: async (feedbackId: string): Promise<Feedback> => {
    try {
      const response = await axiosInstance.get(`/${feedbackId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'fetch feedback details');
    }
  },

  // Get member's feedback
  getMemberFeedback: async (memberId: string): Promise<Feedback[]> => {
    try {
      const response = await axiosInstance.get(`/member/${memberId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'fetch member feedback');
    }
  },

  // Respond to feedback (Admin/Trainer)
  respondToFeedback: async (feedbackId: string, data: FeedbackResponseRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post(`/${feedbackId}/respond`, data);
      return response.data;
    } catch (error) {
      handleError(error, 'respond to feedback');
    }
  },

  // Delete feedback (Admin only)
  deleteFeedback: async (feedbackId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`/${feedbackId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'delete feedback');
    }
  },

  // Update feedback (Member only)
  updateFeedback: async (feedbackId: string, data: CreateFeedbackRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put(`/${feedbackId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  // Update feedback response (Admin/Trainer)
  updateFeedbackResponse: async (feedbackId: string, responseIndex: number, content: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put(`/${feedbackId}/responses/${responseIndex}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error updating feedback response:', error);
      throw error;
    }
  },

  // Delete feedback response (Admin/Trainer)
  deleteFeedbackResponse: async (feedbackId: string, responseIndex: number): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`/${feedbackId}/responses/${responseIndex}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting feedback response:', error);
      throw error;
    }
  }
};

export default feedbackService;
