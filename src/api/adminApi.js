import axiosClient from './axiosClient';

const adminApi = {
  // Tournaments
  getTournamentsDashboard: () => axiosClient.get('/v1/tournaments/dashboard'),
  createTournament: (adminId, data) => axiosClient.post(`/v1/tournaments/${adminId}`, data),
  getTournamentById: (id) => axiosClient.get(`/v1/tournaments/${id}`),
  updateTournament: (id, data) => axiosClient.put(`/v1/tournaments/${id}`, data),
  cancelTournament: (id, data) => axiosClient.put(`/v1/tournaments/${id}/cancel`, data),

  // Races
  getRacesByTournament: (tournamentId) => axiosClient.get(`/v1/races/tournament/${tournamentId}`),
  createRace: (data) => axiosClient.post('/v1/races', data),
  getRaceById: (id) => axiosClient.get(`/v1/races/${id}`),
  updateRace: (id, data) => axiosClient.put(`/v1/races/${id}`, data),
  cancelRace: (raceId, data) => axiosClient.put(`/v1/races/${raceId}/cancel`, data),
  getRaceOfficialResults: (raceId) => axiosClient.get(`/v1/races/${raceId}/results`),

  // Referees
  getReferees: () => axiosClient.get('/v1/referees'),

  // Race Formats
  getRaceFormats: () => axiosClient.get('/raceformats'),
  createRaceFormat: (data) => axiosClient.post('/raceformats', data),
  updateRaceFormat: (id, data) => axiosClient.put(`/raceformats/${id}`, data),
  deleteRaceFormat: (id) => axiosClient.delete(`/raceformats/${id}`),

  // Medical (Registration Forms & Doctors)
  getRegistrationForms: () => axiosClient.get('/registrationforms'),
  getPendingAdminForms: (adminId) => axiosClient.get(`/registrationforms/pending-admin/${adminId}`),
  adminRespondRegistration: (id, data) => axiosClient.put(`/registrationforms/${id}/admin-respond`, data),
  getDoctors: () => axiosClient.get('/doctors'),
  assignDoctor: (data) => axiosClient.post('/healthchecks', data),

  // Verifications
  getJockeyCerts: (recipientId) => axiosClient.get(`/v1/verifications/jockey-certs?recipientId=${recipientId}`),
  getJockeyCertImages: (jockeyId) => axiosClient.get(`/v1/verifications/jockey-certs/${jockeyId}/images`),
  acceptJockeyCert: (jockeyId, adminId) => axiosClient.put(`/v1/verifications/jockey-certs/${jockeyId}/accept?adminId=${adminId}`),
  rejectJockeyCert: (jockeyId, adminId, reason) => axiosClient.put(`/v1/verifications/jockey-certs/${jockeyId}/reject?adminId=${adminId}`, { reason }),

  // Notifications
  getNotifications: (adminId) => axiosClient.get(`/v1/notifications/admin/${adminId}`),
  markAllNotificationsRead: (adminId) => axiosClient.put(`/v1/notifications/admin/${adminId}/read`),

  // Users
  getUsers: () => axiosClient.get('/users'),
  getUsersExcludeCurrent: (id) => axiosClient.get(`/users/exclude/${id}`),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  updateUser: (id, data) => axiosClient.put(`/users/${id}`, data),
  createUser: (data) => axiosClient.post('/users', data)
};

export default adminApi;
