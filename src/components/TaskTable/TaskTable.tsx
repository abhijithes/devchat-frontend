import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { endpoints } from "../../constant/constant";

interface Task {
    _id: string;
    name: string;
    email: string;
    priority: "urgent" | "required" | "completed";
    status: string;
    assignee: { email: string };
    uptime: string;
    taskId: string;
    dueDate?: Date;
}

interface Props {
    projectId: string; // so we can fetch per project
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
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch all tasks
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem("token") || "";
                const res = await axios.get(endpoints.getTasks(projectId), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("Fetched tasks:", res.data[0]);
                setTasks(res.data || []);
            } catch (err) {
                console.error("Error fetching tasks:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [projectId]);

    // ✅ Delete Task
    const handleDelete = async (taskId: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            await axios.delete(endpoints.deleteTask(projectId, taskId));
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    // ✅ Edit Task (example only)
    const handleEdit = async (taskId: string) => {
        const newStatus = prompt("Enter new status:");
        if (!newStatus) return;
        try {
            await axios.put(endpoints.updateTask(projectId, taskId), {
                status: newStatus,
            });
            setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
        } catch (err) {
            console.error("Error updating task:", err);
        }
    };

    if (loading) return <p>Loading tasks...</p>;

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
                        Total Tasks: <span className="font-bold text-[var(--color-accent)]">{tasks.length}</span>
                    </p>
                    <button
                        className="transition px-4 py-2 rounded-md text-sm font-medium"
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
                            {["ID", "Task name", "Priority", "Status", "Assignee", "Uptime", "Edit", "Delete"].map(
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
                                <td className="py-3 px-4">{task.assignee.email}</td>
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
            </div>
        </div>
    );
};

export default TaskTable;
