import { apiRequest } from './api';

export const refereeService = {
  // Get Referees (available to be scheduled)
  getReferees(date, startTime, endTime, excludeRaceId) {
    let url = '/api/v1/referees';
    const params = [];
    if (date) params.push(`date=${encodeURIComponent(date)}`);
    if (startTime) params.push(`startTime=${encodeURIComponent(startTime)}`);
    if (endTime) params.push(`endTime=${encodeURIComponent(endTime)}`);
    if (excludeRaceId) params.push(`excludeRaceId=${excludeRaceId}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return apiRequest(url, {
      method: 'GET',
    });
  },

  // Get Scheduled Races
  getScheduledRaces(refereeId) {
    return apiRequest(`/api/v1/referees/${refereeId}/scheduled-races`, {
      method: 'GET',
    });
  },

  // Referee Invitations
  getPendingInvitations(refereeId) {
    return apiRequest(`/api/v1/notifications/referees/${refereeId}/invitations`, {
      method: 'GET',
    });
  },

  respondToInvitation(refereeId, notificationId, payload) {
    return apiRequest(`/api/v1/notifications/referees/${refereeId}/invitations/${notificationId}/respond`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Referee Notifications
  getNotifications(refereeId) {
    return apiRequest(`/api/v1/notifications/referees/${refereeId}`, {
      method: 'GET',
    });
  },
};
