import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import DialogueBox from "../../components/dailogue-box/dialogueBox";
import { endpoints } from "../../constant/constant";

interface Task {
    _id: string;
    name: string;
    email: string;
    priority: "urgent" | "required" | "completed";
    status: string;
    assignee: { email: string };
    assigner: { email: string };
    uptime: string;
    taskId: string;
    dueDate?: Date;
}

interface TasksResponse {
    data: Task[];
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
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
    const [showDialog, setShowDialog] = useState(false);
    const queryClient = useQueryClient();

    const [newTask, setNewTask] = useState({
        taskId: "",
        name: "",
        priority: "required" as "urgent" | "required" | "completed",
        status: "pending",
        assigneeEmail: "",
        assignerEmail: "",
        dueDate: "",
    });

    // Fetch tasks with pagination using React Query
    const {
        data: tasksData,
        isLoading,
        error,
        isPlaceholderData,
    } = useQuery({
        queryKey: ["tasks", projectId, currentPage, limit],
        queryFn: async (): Promise<TasksResponse> => {
            const token = localStorage.getItem("token") || "";
            const res = await axios.get(endpoints.getTasks(projectId, currentPage, limit), {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        },
        placeholderData: (previousData) => previousData,
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            const token = localStorage.getItem("token") || "";
            await axios.delete(endpoints.deleteTask(projectId, taskId), {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        },
    });

    // Update task mutation
    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
            const token = localStorage.getItem("token") || "";
            await axios.put(
                endpoints.updateTask(projectId, taskId),
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        },
    });

    // Create task mutation
    const createTaskMutation = useMutation({
        mutationFn: async (taskData: typeof newTask) => {
            const token = localStorage.getItem("token") || "";
            await axios.post(
                endpoints.createTask(projectId),
                {
                    taskId: taskData.taskId,
                    name: taskData.name,
                    priority: taskData.priority,
                    status: taskData.status,
                    assigneeEmail: taskData.assigneeEmail,
                    assignerEmail: taskData.assignerEmail,
                    dueDate: taskData.dueDate,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            setShowDialog(false);
            setNewTask({
                taskId: "",
                name: "",
                priority: "required",
                status: "pending",
                assigneeEmail: "",
                assignerEmail: "",
                dueDate: "",
            });
        },
    });

    const handleDelete = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        deleteTaskMutation.mutate(taskId);
    };

    const handleEdit = async (taskId: string) => {
        const newStatus = prompt("Enter new status:");
        if (!newStatus) return;
        updateTaskMutation.mutate({ taskId, status: newStatus });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value });
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        createTaskMutation.mutate(newTask);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    if (isLoading) return <p>Loading tasks...</p>;
    if (error) return <p>Error loading tasks</p>;

    const tasks = tasksData?.data || [];
    const totalPages = tasksData?.totalPages || 1;
    const currentPageData = tasksData?.page || 1;
    const totalTasks = tasksData?.totalTasks || 0;

    return (
        <div
            className="w-full rounded-2xl shadow-md p-6"
            style={{
                backgroundColor: "var(--color-background)",
                color: "var(--color-text)",
                fontFamily: "var(--font-family)",
            }}
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">Project Tasks</h1>
                    <p className="text-[var(--color-secondary)] font-medium pt-2 cursor-pointer">
                        All tasks for this project
                    </p>
                </div>

                <div className="flex items-center gap-4 mt-3 md:mt-0">
                    <p className="text-sm font-semibold">
                        Total Tasks: <span className="font-bold text-[var(--color-accent)]">{totalTasks}</span>
                    </p>
                    <button
                        onClick={() => setShowDialog(true)}
                        className="transition px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
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
                        <tr className="border-b border-[var(--color-primary)]">
                            {["ID", "Task name", "Priority", "Status", "Assignee", "Due Date", "Edit", "Delete"].map(
                                (heading) => (
                                    <th
                                        key={heading}
                                        className="py-3 px-4 font-semibold text-[var(--color-text)] text-left"
                                    >
                                        {heading}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task) => (
                            <tr
                                key={task._id}
                                className="border-b border-[var(--color-primary)] hover:bg-[var(--color-primary)] transition"
                            >
                                <td className="py-3 px-4 font-medium">{task.taskId}</td>
                                <td className="py-3 px-4 truncate max-w-[180px]">{task.name}</td>
                                <td className="py-3 px-4 flex items-center gap-2">
                                    <span className={`${getPriorityColor(task.priority)} w-3 h-3 rounded-sm`}></span>
                                    <span className="capitalize">{task.priority}</span>
                                </td>
                                <td className="py-3 px-4">{task.status}</td>
                                <td className="py-3 px-4">{task.assignee?.email}</td>
                                <td className="py-3 px-4">
                                    {task.dueDate
                                        ? new Date(task.dueDate).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                          })
                                        : "No due date"}
                                </td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => handleEdit(task._id)}
                                        className="flex items-center justify-center rounded-md p-2"
                                        style={{
                                            backgroundColor: "var(--color-primary)",
                                            color: "var(--color-accent)",
                                        }}
                                        title="Edit Task"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </td>

                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => handleDelete(task._id)}
                                        className="flex items-center justify-center rounded-md p-2"
                                        style={{
                                            backgroundColor: "var(--color-primary)",
                                            color: "red",
                                        }}
                                        title="Delete Task"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => handlePageChange(currentPageData - 1)}
                            disabled={currentPageData <= 1}
                            className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: "var(--color-button)",
                                color: "var(--color-background)",
                            }}
                        >
                            Previous
                        </button>

                        <span className="text-sm text-[var(--color-text)]">
                            Page {currentPageData} of {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPageData + 1)}
                            disabled={currentPageData >= totalPages || isPlaceholderData}
                            className="px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: "var(--color-button)",
                                color: "var(--color-background)",
                            }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* DialogueBox for adding task */}
            {showDialog && (
                <DialogueBox onClose={() => setShowDialog(false)}>
                    <form onSubmit={handleCreateTask} className="bg-white p-6 w-full max-w-2xl mx-auto font-sans">
                        {/* Header */}
                        <h2 className="text-xl font-semibold text-gray-800 mb-5">Add New Task</h2>

                        {/* Grid layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Task ID */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-1">Task ID</label>
                                <input
                                    type="text"
                                    name="taskId"
                                    placeholder="Enter unique Task ID"
                                    value={newTask.taskId}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-gray-50"
                                />
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-1">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={newTask.dueDate}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-gray-50"
                                />
                            </div>

                            {/* Task Name (full width) */}
                            <div className="sm:col-span-2">
                                <label className="block text-gray-600 text-sm mb-1">Task Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter task name"
                                    value={newTask.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-gray-50"
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-1">Priority</label>
                                <select
                                    name="priority"
                                    value={newTask.priority}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-gray-50"
                                >
                                    <option value="urgent">Urgent</option>
                                    <option value="required">Required</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-1">Status</label>
                                <input
                                    type="text"
                                    name="status"
                                    placeholder="e.g. pending, in progress"
                                    value={newTask.status}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-gray-50"
                                />
                            </div>

                            {/* Assignee Email (full width) */}
                            <div className="sm:col-span-2">
                                <label className="block text-gray-600 text-sm mb-1">Assignee Email</label>
                                <input
                                    type="email"
                                    name="assigneeEmail"
                                    placeholder="Enter assignee's email"
                                    value={newTask.assigneeEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-gray-50"
                                />
                            </div>

                            {/* Assigner Email (full width) */}
                            <div className="sm:col-span-2">
                                <label className="block text-gray-600 text-sm mb-1">Assigner Email</label>
                                <input
                                    type="email"
                                    name="assignerEmail"
                                    placeholder="Enter assigner's email"
                                    value={newTask.assignerEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] bg-gray-50"
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-6 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowDialog(false)}
                                className="px-5 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createTaskMutation.status === "pending"}
                                className="px-5 py-2 rounded-md text-white font-medium transition disabled:opacity-50"
                                style={{ backgroundColor: "var(--color-button)" }}
                            >
                                {createTaskMutation.status === "pending" ? "Creating..." : "Create Task"}
                            </button>
                        </div>
                    </form>
                </DialogueBox>
            )}
        </div>
    );
};

export default TaskTable;
