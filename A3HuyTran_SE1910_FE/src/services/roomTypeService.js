import api from './api';

export const roomTypeService = {
  getAllRoomTypes: async () => {
    const response = await api.get('/room-types');
    return response.data;
  },

  getRoomTypeById: async (id) => {
    const response = await api.get(`/room-types/${id}`);
    return response.data;
  },

  createRoomType: async (data) => {
    const response = await api.post('/room-types', data);
    return response.data;
  },

  updateRoomType: async (id, data) => {
    const response = await api.put(`/room-types/${id}`, data);
    return response.data;
  },

  deleteRoomType: async (id) => {
    const response = await api.delete(`/room-types/${id}`);
    return response.data;
  }
};

