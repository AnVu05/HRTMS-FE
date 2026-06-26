import { apiRequest } from './api';

export const raceService = {
  /**
   * Tạo cuộc đua mới (Race)
   * @param {Object} data payload JSON chứa thông tin cuộc đua (date, tournament_id, race_name, distance_m, v.v.)
   */
  createRace(data) {
    return apiRequest('/api/v1/races', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Lấy thông tin chi tiết giải đấu và danh sách các cuộc đua thuộc về giải đấu đó
   * @param {string} tournamentId
   */
  getTournamentRaceDetails(tournamentId) {
    return apiRequest(`/api/v1/races/tournament/${tournamentId}`, {
      method: 'GET'
    });
  },

  /**
   * Cập nhật thông tin cuộc đua
   * @param {string|number} id
   * @param {Object} data
   */
  updateRace(id, data) {
    return apiRequest(`/api/v1/races/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
};
