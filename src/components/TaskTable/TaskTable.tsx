import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import DialogueBox from "../../components/dailogue-box/dialogueBox";
import { endpoints } from "../../constant/constant";
import FindUser from "../find-users/FindUser";
import { useLoader } from "../../contexts/GlobalLoaderContext";

export interface CreatedBy {
  _id: string;
  email: string;
}

export interface ProjectInfo {
  name: string;
  createdAt: string;
  updatedAt: string;
  createdBy: CreatedBy;
}

export interface Assignee {
  _id: string;
  email: string;
}

export interface Task {
  _id: string;
  name: string;
  priority: string;
  status: string;
  assignee: Assignee;
  project: string;
  dueDate: string;
  taskId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProjectTaskResponse {
  project: ProjectInfo;
  data: Task[];
  userRole: string;
  page: number;
  limit: number;
  totalTasks: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Props {
  projectId: string;
}

const getPriorityColor = (priority: Task["priority"]) => {
  switch (priority) {
    case "urgent":
      return "bg-red-500";
    case "required":
      return "bg-[var(--color-accent)]";
    case "completed":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
};

const TaskTable: React.FC<Props> = ({ projectId }) => {
  const [tasksData, setTasksData] = useState<ProjectTaskResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  const [newTask, setNewTask] = useState({
    taskId: "",
    name: "",
    priority: "required",
    status: "pending",
    assigneeEmail: "",
    dueDate: "",
  });

  const tasks = tasksData?.data || [];

  const fetchTasks = async () => {
    try {
      showLoader();
      const token = localStorage.getItem("token") || "";
      const res = await axios.get(endpoints.getTasks(projectId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasksData(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      hideLoader();
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token") || "";
      await axios.delete(endpoints.deleteTask(projectId, taskId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasksData((prev) =>
        prev
          ? { ...prev, data: prev.data.filter((t) => t._id !== taskId) }
          : prev
      );
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const handleEdit = async (taskId: string) => {
    const newStatus = prompt("Enter new status:");
    if (!newStatus) return;
    try {
      const token = localStorage.getItem("token") || "";
      await axios.put(
        endpoints.updateTask(projectId, taskId),
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasksData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((task) =>
                task._id === taskId ? { ...task, status: newStatus } : task
              ),
            }
          : prev
      );
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token") || "";
      await axios.post(
        endpoints.createTask(projectId),
        {
          taskId: newTask.taskId,
          name: newTask.name,
          priority: newTask.priority,
          status: newTask.status,
          assigneeEmail: newTask.assigneeEmail,
          dueDate: newTask.dueDate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowDialog(false);
      setNewTask({
        taskId: "",
        name: "",
        priority: "required",
        status: "pending",
        assigneeEmail: "",
        dueDate: "",
      });
      fetchTasks();
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div
      className="w-full rounded-2xl"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-text)",
        fontFamily: "var(--font-family)",
      }}
    >
      <div className="w-full min-h-32  space-y-2 ">
        <h1 className="text-2xl font-medium">{tasksData.project.name}</h1>
        <h1 className="text-sm">
          @ {new Date(new Date(tasksData.project.createdAt)).toLocaleString()}
        </h1>
        <h1>
          By{" "}
          <span className="font-medium">
            {tasksData.project.createdBy.email}
          </span>{" "}
        </h1>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold">Project Tasks</h1>
          <p className="text-[var(--color-secondary)] font-medium pt-2">
            All tasks for this project
          </p>
        </div>
        <div className="flex items-center gap-4 mt-3 md:mt-0">
          <p className="text-sm font-semibold">
            Total Tasks:{" "}
            <span className="font-bold text-[var(--color-accent)]">
              {tasks.length}
            </span>
          </p>
          <button
            onClick={() => setShowDialog(true)}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{
              backgroundColor: "var(--color-button)",
              color: "var(--color-background)",
            }}
          >
            New Task
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm md:text-base">
          <thead>
            <tr className=" border-[var(--color-primary)]">
              {[
                "ID",
                "Task name",
                "Priority",
                "Status",
                "Assignee",
                "Uptime",
                "Edit",
                "Delete",
              ].map((heading) => (
                <th key={heading} className="py-3 px-4 font-semibold text-left">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task._id}
                className=" hover:bg-[var(--color-primary)] transition"
              >
                <td className="py-3 px-4 font-medium">{task.taskId}</td>
                <td className="py-3 px-4 truncate max-w-[180px]">
                  {task.name}
                </td>
                <td className="py-3 px-4 flex items-center gap-2">
                  <span
                    className={`${getPriorityColor(
                      task.priority
                    )} w-3 h-3 rounded-sm`}
                  ></span>
                  <span className="capitalize">{task.priority}</span>
                </td>
                <td className="py-3 px-4">{task.status}</td>
                <td className="py-3 px-4">{task?.assignee?.email}</td>
                <td className="py-3 px-4">
                  {new Date(task.dueDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEdit(task._id)}
                    className="p-2 rounded-md"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "var(--color-accent)",
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="p-2 rounded-md"
                    style={{
                      backgroundColor: "var(--color-primary)",
                      color: "red",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Task Dialog */}
      {showDialog && (
        <DialogueBox onClose={() => setShowDialog(false)}>
          <form
            onSubmit={handleCreateTask}
            className="p-6 w-full max-w-2xl bg-white mx-auto"
          >
            <h2 className="text-xl font-semibold mb-5">Add New Task</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-600">Task ID</label>
                <input
                  type="text"
                  name="taskId"
                  value={newTask.taskId}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={newTask.dueDate}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Task Name</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Priority</label>
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                >
                  <option value="urgent">Urgent</option>
                  <option value="required">Required</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <input
                  type="text"
                  name="status"
                  value={newTask.status}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm text-gray-600">Assignee</label>
                <FindUser
                  users={[
                    { _id: "123", name: "manuraj" },
                    { _id: "125", name: "test" },
                    { _id: "126", name: "user3" },
                    { _id: "127", name: "user4" },
                    { _id: "128", name: "user5" },
                  ]}
                  selectType="single"
                  onUserSelect={(user: any) => {
                    setNewTask((prev) => ({
                      ...prev,
                      assigneeEmail: user.name,
                    }));
                  }}
                  activeStyle="bg-zinc-200"
                  inputStyle="bg-gray-50 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                className="px-5 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md text-white"
                style={{ backgroundColor: "var(--color-button)" }}
              >
                Create Task
              </button>
            </div>
          </form>
        </DialogueBox>
      )}
    </div>
  );
};

export default TaskTable;
