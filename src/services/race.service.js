import axiosClient from './axiosClient';

export const raceApi = {
  // 1. Race Control APIs
  createRace: (data) => {
    return axiosClient.post('/v1/races', data);
  },
  createRacesBatch: (data) => {
    return axiosClient.post('/v1/races/batch', data);
  },
  getAllRaces: () => {
    return axiosClient.get('/v1/races');
  },
  getRaceById: (id) => {
    return axiosClient.get(`/v1/races/${id}`);
  },
  updateRace: (id, data) => {
    return axiosClient.put(`/v1/races/${id}`, data);
  },
  startRace: (id) => {
    return axiosClient.put(`/v1/races/${id}/start`);
  },
  cancelRace: (id, data) => {
    return axiosClient.put(`/v1/races/${id}/cancel`, data);
  },
  updateRaceTime: (id, data) => {
    return axiosClient.put(`/v1/races/${id}/time`, data);
  },
  lateScratch: (id, horseId, reason) => {
    return axiosClient.put(`/v1/races/${id}/late-scratch?horseId=${horseId}&reason=${encodeURIComponent(reason)}`);
  },
  disqualifyHorse: (id, horseId, reason) => {
    return axiosClient.put(`/v1/races/${id}/disqualify?horseId=${horseId}&reason=${encodeURIComponent(reason)}`);
  },

  // 2. Race Result APIs
  createRaceResult: (data) => {
    return axiosClient.post('/raceresults', data);
  },
  getAllRaceResults: () => {
    return axiosClient.get('/raceresults');
  },
  getRaceResultById: (id) => {
    return axiosClient.get(`/raceresults/${id}`);
  },
  updateRaceResult: (id, data) => {
    return axiosClient.put(`/raceresults/${id}`, data);
  },
  deleteRaceResult: (id) => {
    return axiosClient.delete(`/raceresults/${id}`);
  },

  // 3. Race Placement APIs
  createPlacement: (data) => {
    return axiosClient.post('/raceplacements', data);
  },
  getAllPlacements: () => {
    return axiosClient.get('/raceplacements');
  },
  getPlacementById: (id) => {
    return axiosClient.get(`/raceplacements/${id}`);
  },
  updatePlacement: (id, data) => {
    return axiosClient.put(`/raceplacements/${id}`, data);
  },
  deletePlacement: (id) => {
    return axiosClient.delete(`/raceplacements/${id}`);
  }
};
