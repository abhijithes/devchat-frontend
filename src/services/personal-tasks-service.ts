import { endpoints } from "../constant/constant";
import api from "../utils/axios";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
} from "../types/personal-tasks";

const BASE = endpoints.personaTasks;

export const taskService = {
  getAll: async (filters: TaskFilters = {}): Promise<Task[]> => {
    const params: Record<string, string | boolean> = {};
    if (filters.completed !== undefined) params.completed = filters.completed;
    if (filters.priority) params.priority = filters.priority;

    const { data } = await api.get<Task[]>(BASE, { params });
    return data;
  },

  getById: async (id: string): Promise<Task> => {
    const { data } = await api.get<Task>(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: CreateTaskInput): Promise<Task> => {
    const { data } = await api.post<Task>(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateTaskInput): Promise<Task> => {
    const { data } = await api.put<Task>(`${BASE}/${id}`, payload);
    return data;
  },

  toggle: async (id: string): Promise<Task> => {
    const { data } = await api.patch<Task>(`${BASE}/${id}/toggle`);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};

export default taskService;