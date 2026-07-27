import axiosClient from './axiosClient';

export const authApi = {
  login: (data) => {
    return axiosClient.post('/v1/auth/login', data);
  },
  verifyOtp: (data) => {
    return axiosClient.post('/v1/auth/verify-otp', data);
  },
  register: (data) => {
    return axiosClient.post('/v1/auth/register', data);
  },
  logout: () => {
    return axiosClient.post('/v1/auth/logout');
  },
  forgotPassword: (data) => {
    return axiosClient.post('/v1/auth/forgot-password', data);
  },
  resetPassword: (data) => {
    return axiosClient.post('/v1/auth/reset-password', data);
  }
};
