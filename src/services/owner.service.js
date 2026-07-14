import axiosClient from './axiosClient';

export const ownerApi = {
  getAllUsers: () => {
    return axiosClient.get('/users');
  },
  getFeaturedTournaments: () => {
    return axiosClient.get('/v1/tournaments/active');
  },
  getAllTournaments: () => {
    return axiosClient.get('/v1/tournaments/dashboard');
  },
  getUpcomingRaces: () => {
    return axiosClient.get('/v1/races');
  },
  getTournamentById: (id) => {
    return axiosClient.get(`/v1/tournaments/${id}`);
  },
  getRacesByTournament: (id) => {
    return axiosClient.get(`/v1/races/tournament/${id}`);
  },
  getRaceById: (id) => {
    return axiosClient.get(`/v1/races/${id}`);
  },
  getRaceResults: (id) => {
    return axiosClient.get(`/v1/races/${id}/results`);
  },
  getRaceStartingLineup: (id) => {
    return axiosClient.get(`/registrationforms/race/${id}/racing`);
  },
  getJockeys: () => {
    return axiosClient.get('/jockeys');
  },
  getJockeyProfile: (id) => {
    return axiosClient.get(`/jockeys/${id}/profile`);
  },
  getHorsesByOwner: (ownerId) => {
    return axiosClient.get(`/horses/owner/${ownerId}`);
  },
  createHorse: (data) => {
    return axiosClient.post('/horses', data);
  },
  updateHorse: (id, data) => {
    return axiosClient.put(`/horses/${id}`, data);
  },
  getHorseById: (id) => {
    return axiosClient.get(`/horses/${id}`);
  },
  getRegistrationsByOwner: (ownerId) => {
    return axiosClient.get(`/registrationforms/owner/${ownerId}`);
  },
  createRegistration: (data) => {
    return axiosClient.post('/registrationforms', data);
  },
  updateRegistration: (id, data) => {
    return axiosClient.put(`/registrationforms/${id}`, data);
  },
  cancelRegistration: (id) => {
    return axiosClient.delete(`/registrationforms/${id}`);
  },
  getNotifications: (ownerId) => {
    return axiosClient.get(`/v1/notifications/horse-owners/${ownerId}`);
  },
  markNotificationsAsRead: (ownerId) => {
    return axiosClient.put(`/v1/notifications/recipients/${ownerId}/read`);
  },
  getProfile: (ownerId) => {
    return axiosClient.get(`/horse-owners/${ownerId}/profile`);
  },
  updateProfile: (ownerId, data) => {
    return axiosClient.put(`/horse-owners/${ownerId}/profile`, data);
  },
  updateAvatar: (ownerId, data) => {
    return axiosClient.put(`/horse-owners/${ownerId}/avatar`, data);
  },
  deactivateAccount: (ownerId) => {
    return axiosClient.delete(`/horse-owners/${ownerId}`);
  }
};

export const ownerService = ownerApi;
export default ownerApi;
