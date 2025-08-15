import axios from 'axios';

// const API_URL = 'http://localhost:8080/api/diet-chat';
const API_URL = 'https://gym-management-9waw.onrender.com/api/diet-chat';


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

export interface ChatMessage {
  senderId: string;
  content: string;
  timestamp: string;
  senderRole: string;
}

export interface DietChat {
  id: string;
  memberId: string;
  title: string;
  initialQuery: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface CreateDietChatRequest {
  title: string;
  initialQuery: string;
}

export interface DietChatReplyRequest {
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

const dietChatService = {
  // Create new diet chat (Member only)
  createDietChat: async (data: CreateDietChatRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post('', data);
      return response.data;
    } catch (error) {
      handleError(error, 'create diet chat');
    }
  },

  // Get all diet chats
  getAllDietChats: async (): Promise<DietChat[]> => {
    try {
      const response = await axiosInstance.get('');
      return response.data;
    } catch (error) {
      handleError(error, 'fetch diet chats');
    }
  },

  // Get diet chat by ID
  getDietChatById: async (chatId: string): Promise<DietChat> => {
    try {
      const response = await axiosInstance.get(`/${chatId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'fetch diet chat');
    }
  },

  // Get member's diet chats
  getMemberDietChats: async (memberId: string): Promise<DietChat[]> => {
    try {
      const response = await axiosInstance.get(`/member/${memberId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'fetch member diet chats');
    }
  },

  // Reply to diet chat (Admin/Trainer)
  replyToDietChat: async (chatId: string, data: DietChatReplyRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.post(`/${chatId}/reply`, data);
      return response.data;
    } catch (error) {
      handleError(error, 'reply to diet chat');
    }
  },

  // Update diet chat title (Member only)
  updateDietChatTitle: async (chatId: string, data: CreateDietChatRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put(`/${chatId}`, data);
      return response.data;
    } catch (error) {
      handleError(error, 'update diet chat');
    }
  },

  // Update message
  updateMessage: async (chatId: string, messageIndex: number, content: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.put(`/${chatId}/messages/${messageIndex}`, { content });
      return response.data;
    } catch (error) {
      handleError(error, 'update message');
    }
  },

  // Delete message
  deleteMessage: async (chatId: string, messageIndex: number): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`/${chatId}/messages/${messageIndex}`);
      return response.data;
    } catch (error) {
      handleError(error, 'delete message');
    }
  },

  // Delete diet chat
  deleteDietChat: async (chatId: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`/${chatId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'delete diet chat');
    }
  },

  // Get trainer's assigned diet chats (Trainer only)
  getTrainerDietChats: async (trainerId: string): Promise<DietChat[]> => {
    try {
      const response = await axiosInstance.get(`/trainer/${trainerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching trainer diet chats:', error);
      throw error;
    }
  }
};

export default dietChatService;
