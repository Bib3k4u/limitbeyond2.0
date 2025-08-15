import { axiosInstance } from './axiosInstance';

export const paymentApi = {
  createPayment: (payload: any) => axiosInstance.post('/admin/payments', payload),
  getPaymentsForUser: (userId: string) => axiosInstance.get(`/admin/payments/user/${userId}`),
  getRevenue: (startDate: string, endDate: string) => axiosInstance.get(`/admin/payments/revenue?start=${startDate}&end=${endDate}`),
};
