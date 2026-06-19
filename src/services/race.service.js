import { apiRequest } from './api';

export const raceService = {
  /**
   * Tạo danh sách (hàng loạt) cuộc đua (Races) cho một giải đấu
   * @param {Object} data
   * @param {string} data.tournamentId
   * @param {Array} data.races Danh sách races gồm (name, date, startTime, endTime, laps, numHorse)
   */
  createRacesBatch(data) {
    return apiRequest('/api/v1/races/batch', {
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
  }
};
