import React, { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ProjectTaskResponse, Task } from "./TaskTypes";
import api from "../../utils/axios";
import { endpoints } from "../../constant/constant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddTask } from "./AddTask";
import { EditTask } from "./EditTask";
import DeleteConfirmation from "../Conformation/DeleteConformation";
import { useSnackBar } from "../snack-bar/snack-bar-context";
import { Link } from "react-router-dom";
import CheckUserRole from "../check-user-role/CheckUserRole";

interface TaskTableProps {
    projectId: string;
    page?: number;
    limit?: number;
}
interface deleteTask {
    id: string;
    name: string;
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

// Fetch tasks
const fetchTasks = async (projectId: string, page: number, limit: number): Promise<ProjectTaskResponse> => {
    const res = await api.get(endpoints.getTasks(projectId, page, limit));
    return res.data;
};

const TaskTable: React.FC<TaskTableProps> = ({ projectId, page = 1, limit = 10 }) => {
    const [showDialog, setShowDialog] = useState<"false" | "edit" | "add" | "delete">("false");
    const [deletingTask, setDeletingTask] = useState<deleteTask | null>({ id: "", name: "" });
    const [currentPage, setCurrentPage] = useState(page);
    const queryClient = useQueryClient();
    const { showSnackBar } = useSnackBar();
    const [newTask, setNewTask] = useState<Task>({
        _id: "",
        taskId: "",
        name: "",
        priority: "required",
        status: "not-started",
        assignee: {
            _id: "",
            email: "",
            firstName: "",
            lastName: "",
            profilePicture: "",
        },
        assigner: {
            _id: "",
            email: "",
            firstName: "",
            lastName: "",
            profilePicture: "",
        },
        dueDate: "",
    });

    // React Query
    const {
        data: tasksData,
        isLoading,
        isError,
    } = useQuery<ProjectTaskResponse, Error>({
        queryKey: ["tasks", projectId, currentPage, limit],
        queryFn: () => fetchTasks(projectId, currentPage, limit),
        staleTime: 1000 * 60,
    });

    const tasks = tasksData?.data || [];
    const members = tasksData?.members || [];
    const totalPages = tasksData?.totalPages || 1;
    const TableHeaders =
        tasksData?.userRole !== "member"
            ? ["ID", "Task name", "Priority", "Status", "Assignee", "Due Date", "Edit", "Delete"]
            : ["ID", "Task name", "Priority", "Status", "Assignee", "Due Date"];

    // Edit task
    const handleEdit = async (taskId: string) => {
        const task = tasks.find((t) => t._id === taskId);
        if (!task) return;

        await setNewTask({
            _id: task._id ?? "",
            taskId: task.taskId ?? "",
            name: task.name ?? "",
            priority: task.priority ?? "required",
            status: task.status ?? "not-started",
            assignee: {
                _id: task.assignee._id ?? "",
                email: task.assignee.email ?? "",
                firstName: task.assignee.firstName ?? "",
                lastName: task.assignee.lastName ?? "",
                profilePicture: task.assignee.profilePicture ?? "",
            },
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        });

        setShowDialog("edit");
    };

    const openDeleteModel = (taskId: string, taskName: string) => {
        setDeletingTask({ id: taskId, name: taskName });
        setShowDialog("delete");
    };
    const closeDeleteModel = () => {
        setDeletingTask(null);
        setShowDialog("false");
    };

    const deleteTask = useMutation({
        mutationFn: async (taskId: string) => {
            await api.delete(endpoints.deleteTask(projectId, taskId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            closeDeleteModel();
            showSnackBar("Deleted Task Successfully", "success", 3000);
        },
        onError: (error) => {
            console.error("task deletion failed", error);
            showSnackBar("Deleted Task Failed", "error", 3000);
        },
    });

    const handleOptionChange = (field, id, value) => {};

    const handleDelete = async () => {
        try {
            if (!deletingTask.id) return;
            deleteTask.mutate(deletingTask.id);
        } catch (error) {
            console.error(error);
        } finally {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        }
    };

    const closeDialogueBox = () => {
        setShowDialog("false");
    };

    const paginationButtons = useMemo(() => {
        return Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pageNum = i + Math.max(currentPage - 2, 1);
            if (pageNum > totalPages) return null;
            return (
                <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md border ${
                        pageNum === currentPage ? "bg-[var(--color-accent)] text-white" : "bg-white text-black"
                    }`}
                >
                    {pageNum}
                </button>
            );
        });
    }, [currentPage, totalPages]);

    if (isLoading) return <p>Loading tasks...</p>;
    if (isError) return <p>Failed to load tasks 😢</p>;

    return (
        <div className="w-full rounded-2xl">
            {/* Project Info */}
            <div className="w-full min-h-32 space-y-2">
                <h1 className="text-2xl font-medium">{tasksData?.project.name}</h1>
                <h1 className="text-sm">@ {new Date(tasksData?.project.createdAt || "").toLocaleString()}</h1>
                <h1>
                    By <span className="font-medium">{tasksData?.project.createdBy.email}</span>
                </h1>
            </div>

            {/* Header & New Task */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold">Project Tasks</h1>
                    <p className="text-[var(--color-secondary)] font-medium pt-2">All tasks for this project</p>
                </div>
                <div className="flex items-center gap-4 mt-3 md:mt-0">
                    <p className="text-sm font-semibold">
                        Total Tasks:{" "}
                        <span className="font-bold text-[var(--color-accent)]">{tasksData?.totalTasks || 0}</span>
                    </p>
                    <CheckUserRole userRole={tasksData.userRole}>
                        <button
                            onClick={() => setShowDialog("add")}
                            className="px-4 py-2 rounded-md text-sm font-medium bg-button text-white"
                        >
                            New Task
                        </button>
                    </CheckUserRole>
                </div>
            </div>

            {/* Task Table */}
            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm md:text-base">
                    <thead>
                        <tr className="border-[var(--color-primary)]">
                            {TableHeaders.map((heading) => (
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
                                className="hover:bg-[var(--color-primary)] transition"
                                title={`Assigned By ${task.assigner?.firstName} ${task.assigner?.lastName}`}
                            >
                                <td className="py-3 px-4 font-medium">{task.taskId}</td>
                                <td className="py-3 px-4 truncate max-w-[180px]">{task.name}</td>
                                <td className="py-3 px-4 flex items-center gap-2">
                                    <span className={`${getPriorityColor(task.priority)} w-3 h-3 rounded-sm`}></span>
                                    <span className="capitalize">{task.priority}</span>
                                </td>
                                <td className="py-3 px-4">
                                    <select
                                        name="status"
                                        value={task.status}
                                        onChange={(e) => handleOptionChange("status", task._id, e.target.value)}
                                        className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                                    >
                                        <option value="not-started">Not started</option>
                                        <option value="in-progress">In progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </td>
                                <td className="py-3 px-4">{task.assignee?.email}</td>
                                <td className="py-3 px-4">
                                    {task.dueDate &&
                                        new Date(task.dueDate).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                </td>
                                <CheckUserRole userRole={tasksData.userRole}>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => handleEdit(task._id)}
                                            className="p-2 rounded-md"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => openDeleteModel(task._id, task.name)}
                                            className="p-2 rounded-md"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} color="red" />
                                        </button>
                                    </td>
                                </CheckUserRole>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center gap-2 mt-4 pr-20">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border bg-white text-black disabled:opacity-50"
                >
                    Prev
                </button>

                {paginationButtons}

                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border bg-white text-black disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            {members.length > 0 && (
                <div className="mt-6 rounded-lg bg-white">
                    <div className="px-4 py-3">
                        <h2 className="text-lg font-semibold text-gray-800">Project Team</h2>
                    </div>
                    <div className="p-4">
                        <div className="flex flex-wrap gap-3">
                            {members.map((member) => (
                                <Link to={`/viewprofile/${member._id}`}>
                                    <div
                                        key={member._id}
                                        className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
                                    >
                                        <div className="flex-shrink-0">
                                            {member.profilePicture ? (
                                                <img
                                                    src={member.profilePicture}
                                                    alt={`${member.firstName} ${member.lastName}`}
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-300"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                                                    <span className="text-blue-600 text-sm font-medium">
                                                        {member.firstName?.[0]}
                                                        {member.lastName?.[0]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {member.firstName} {member.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Task Dialog */}
            {showDialog === "add" && <AddTask onClose={closeDialogueBox} member={members} projectId={projectId} />}
            {showDialog === "edit" && (
                <EditTask onClose={closeDialogueBox} member={members} projectId={projectId} initialData={newTask} />
            )}
            {showDialog === "delete" && (
                <DeleteConfirmation
                    message={`Are you sure to delete "${deletingTask.name}?"`}
                    onConfirm={handleDelete}
                    onCancel={closeDeleteModel}
                    isDeleting={deleteTask.isPending}
                />
            )}
        </div>
    );
};

export default TaskTable;
