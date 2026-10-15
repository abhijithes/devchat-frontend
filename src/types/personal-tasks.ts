export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // ISO string
  createdAt: number; // epoch ms
}

/** Payload for creating a task — server fills id/createdAt/completed */
export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  completed?: boolean;
}

/** Payload for updating a task — all fields optional */
export type UpdateTaskInput = Partial<CreateTaskInput>;

/** Query params for GET /tasks */
export interface TaskFilters {
  completed?: boolean;
  priority?: Priority;
}