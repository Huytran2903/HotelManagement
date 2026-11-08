import api from './api';

export const roomService = {
  getPublicRooms: async () => {
    const response = await api.get('/public/rooms');
    return response.data;
  },

  getActiveRooms: async () => {
    const response = await api.get('/public/rooms');
    return response.data;
  },

  getAllRooms: async (params = {}) => {
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  getRoomById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  }
};

