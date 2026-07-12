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

  getCompletedRacesCount(jockeyId) {
    return apiRequest(`/api/jockeys/${jockeyId}/completed-races/count`, {
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

  async createJockeyCertificateVerification(payload) {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const response = await fetch(`${BASE_URL}/api/v1/verifications/jockey-certs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 200 || response.status === 201) {
      try {
        const text = await response.text();
        return JSON.parse(text);
      } catch (e) {
        // Ignore json parse error caused by Jackson recursive serialization on backend
        return { status: 'success', message: 'Created successfully' };
      }
    }

    let errorMessage = 'API request failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData?.message || response.statusText;
    } catch (e) {
      try {
        errorMessage = await response.text() || errorMessage;
      } catch (inner) {}
    }
    throw new Error(errorMessage);
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

  getAllRegistrationForms() {
    return apiRequest('/api/registrationforms', {
      method: 'GET',
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
