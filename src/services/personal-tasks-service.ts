import { endpoints } from "../constant/constant";
import api from "../utils/axios";

const BASE = endpoints.personaTasks;

export const taskService = {
  getAll: async (filters = {}) => {
    const params = {};
    if (filters.completed !== undefined) params.completed = filters.completed;
    if (filters.priority) params.priority = filters.priority;
    const { data } = await api.get(BASE, { params });
    return data;
  },
  getById: async (id) => (await api.get(`${BASE}/${id}`)).data,
  create: async (payload) => (await api.post(BASE, payload)).data,
  update: async (id, payload) => (await api.put(`${BASE}/${id}`, payload)).data,
  toggle: async (id) => (await api.patch(`${BASE}/${id}/toggle`)).data,
  remove: async (id) => {
    await api.delete(`${BASE}/${id}`);
  },
};

export default taskService;