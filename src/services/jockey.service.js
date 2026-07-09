import { apiRequest } from './api';

export const jockeyService = {
  // Profiles
  getAllJockeys() {
    return apiRequest('/api/jockeys', {
      method: 'GET',
    });
  },

  getProfile(jockeyId) {
    return apiRequest(`/api/jockeys/${jockeyId}/profile`, {
      method: 'GET',
    });
  },

  updateProfile(jockeyId, payload) {
    return apiRequest(`/api/jockeys/${jockeyId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Certificates from Jockey Profile Controller
  getJockeyCertificates(jockeyId) {
    return apiRequest(`/api/jockeys/${jockeyId}/certificates`, {
      method: 'GET',
    });
  },

  updateJockeyCertificate(jockeyId, certId, payload) {
    return apiRequest(`/api/jockeys/${jockeyId}/certificates/${certId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteJockeyCertificate(jockeyId, certId) {
    return apiRequest(`/api/jockeys/${jockeyId}/certificates/${certId}`, {
      method: 'DELETE',
    });
  },

  // Jockey Certificates (Category controller `/api/jockeycerts`)
  createCertCategory(payload) {
    return apiRequest('/api/jockeycerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAllCertCategories() {
    return apiRequest('/api/jockeycerts', {
      method: 'GET',
    });
  },

  getCertCategoryById(id) {
    return apiRequest(`/api/jockeycerts/${id}`, {
      method: 'GET',
    });
  },

  updateCertCategory(id, payload) {
    return apiRequest(`/api/jockeycerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteCertCategory(id) {
    return apiRequest(`/api/jockeycerts/${id}`, {
      method: 'DELETE',
    });
  },

  // Verification APIs (`/api/v1/verifications`)
  getJockeyVerificationRequests(recipientId) {
    return apiRequest(`/api/v1/verifications/jockey-certs?recipientId=${recipientId}`, {
      method: 'GET',
    });
  },

  getPendingCertImages(jockeyId) {
    return apiRequest(`/api/v1/verifications/jockey-certs/${jockeyId}/images`, {
      method: 'GET',
    });
  },

  createJockeyCertificateVerification(payload) {
    return apiRequest('/api/v1/verifications/jockey-certs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  requestVerificationForAll(jockeyId) {
    return apiRequest(`/api/v1/verifications/jockey-certs/${jockeyId}/request-verification`, {
      method: 'POST',
    });
  },

  acceptJockeyCertificates(jockeyId, adminId) {
    return apiRequest(`/api/v1/verifications/jockey-certs/${jockeyId}/accept?adminId=${adminId}`, {
      method: 'PUT',
    });
  },

  rejectJockeyCertificates(jockeyId, adminId, reason) {
    return apiRequest(`/api/v1/verifications/jockey-certs/${jockeyId}/reject?adminId=${adminId}`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  // Respond to invitation form
  jockeyRespondToRegistrationForm(formId, payload) {
    return apiRequest(`/api/registrationforms/${formId}/jockey-respond`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Notifications
  getRecentCertificateNotifications(jockeyId) {
    return apiRequest(`/api/v1/notifications/jockeys/${jockeyId}/certificate-results`, {
      method: 'GET',
    });
  },

  getNotifications(jockeyId, page = 0, size = 5) {
    return apiRequest(`/api/v1/notifications/jockeys/${jockeyId}?page=${page}&size=${size}`, {
      method: 'GET',
    });
  },
};
