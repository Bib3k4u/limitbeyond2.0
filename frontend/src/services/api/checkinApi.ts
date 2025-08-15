import { axiosInstance } from './axiosInstance';

export const checkinApi = {
  addCheckin: (userId: string, occurredAt?: string) => axiosInstance.post(`/checkins?userId=${userId}${occurredAt ? `&occurredAt=${encodeURIComponent(occurredAt)}` : ''}`),
  recent: (limit = 50, userId?: string) => axiosInstance.get(`/checkins/recent?limit=${limit}${userId ? `&userId=${userId}` : ''}`),
  between: (start: string, end: string, userId?: string) => axiosInstance.get(`/checkins/between?start=${start}&end=${end}${userId ? `&userId=${userId}` : ''}`),
};
