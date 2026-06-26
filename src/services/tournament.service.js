import { apiRequest } from './api';

export const tournamentService = {
  createTournament(data) {
    const adminIdParsed = parseInt(data.adminId || data.admin_id || 3, 10);

    const payload = {
      name: data.name,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      announcement_date: data.announcementDate || data.announcement_date || null,
      registration_open_date: data.registrationOpenDate || data.registration_open_date || null,
      registration_close_date: data.registrationCloseDate || data.registration_close_date || null,
      tournament_description: data.tournamentDescription || data.tournament_description || data.description || ''
    };

    const finalAdminId = isNaN(adminIdParsed) ? 3 : adminIdParsed;

    // Truyền admin_id vào URL
    return apiRequest(`/api/v1/tournaments/${finalAdminId}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Lấy danh sách tổng quan các giải đấu cho màn hình Dashboard
   */
  getTournamentDashboard() {
    return apiRequest('/api/v1/tournaments/dashboard', {
      method: 'GET'
    });
  },

  /**
   * Lấy nhanh danh sách các giải đấu đang ở trạng thái PUBLIC (dropdown chọn giải)
   */
  getActiveTournaments() {
    return apiRequest('/api/v1/tournaments/active', {
      method: 'GET'
    });
  },

  /**
   * Hủy bỏ toàn bộ một giải đấu
   * @param {string} id
   * @param {string} reason
   */
  cancelTournament(id, reason) {
    return apiRequest(`/api/v1/tournaments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  },
  /**
   * Cập nhật thông tin giải đấu
   * @param {string|number} id
   * @param {Object} data
   */
  updateTournament(id, data) {
    const ageParsed = parseInt(data.allowedHorseAge || data.horse_age_requirement || data.allowed_horse_age, 10);
    const payload = {
      status: data.status,
      tournament_name: data.name || data.tournament_name,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      allowed_horse_breed: data.allowedBreed || data.allowed_horse_breed || data.allowed_breed,
      horse_age_requirement: isNaN(ageParsed) ? 0 : ageParsed,
      tournament_description: data.tournamentDescription || data.tournament_description || data.description || ''
    };
    return apiRequest(`/api/v1/tournaments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }
};
