import axiosClient from './axiosClient';

export const doctorApi = {
  // Health Checks
  getAssignedHealthChecks: (doctorId) => {
    return axiosClient.get(`/healthchecks/doctor/${doctorId}`);
  },
  
  processHealthCheck: (healthCheckId, data) => {
    return axiosClient.put(`/healthchecks/${healthCheckId}/process`, data);
  },

  respondToInvitation: (healthCheckId, doctorId, status) => {
    return axiosClient.put(`/healthchecks/${healthCheckId}`, { doctorId, status });
  },

  // Notifications
  getNotifications: (doctorId) => {
    return axiosClient.get(`/v1/notifications/doctor/${doctorId}`);
  },

  markAllNotificationsRead: (doctorId) => {
    return axiosClient.put(`/v1/notifications/doctor/${doctorId}/read`);
  }
};

export const doctorService = doctorApi;
export default doctorApi;
