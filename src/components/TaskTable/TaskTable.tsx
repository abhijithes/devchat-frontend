import React, { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useLoader } from "../../contexts/GlobalLoaderContext";
import DvcSideBar from "../dvc-side-bar/DvcSideBar";
import DetailedTaskView from "./DetailedTaskView";

interface TaskTableProps {
    projectId: string;
    page?: number;
    limit?: number;
}
interface deleteTask {
    id: string;
    name: string;
}

export const getPriorityColor = (priority: Task["priority"]) => {
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
const fetchTasks = async (
    projectId: string,
    page: number,
    limit: number,
    query: string,
    sortField: string
): Promise<ProjectTaskResponse> => {
    const res = await api.get(endpoints.getTasks(projectId, page, limit, query, sortField));
    return res.data;
};
const patchUpdate = async ({ projectId, id, field, value }) => {
    await api.patch(endpoints.updateTask(projectId, id), { [field]: value });
    return `${field} updated Successfully`;
};

const TaskTable: React.FC<TaskTableProps> = ({ projectId, page = 1, limit = 10 }) => {
    const [showDialog, setShowDialog] = useState<"false" | "edit" | "add" | "delete">("false");
    const [deletingTask, setDeletingTask] = useState<deleteTask | null>({
        id: "",
        name: "",
    });
    const [currentPage, setCurrentPage] = useState(page);
    const queryClient = useQueryClient();
    const { showSnackBar } = useSnackBar();
    const { showLoader, hideLoader } = useLoader();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sort, setSort] = useState("latest");
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
    const [detailedView, setDetailedView] = useState(false);
    const [activeTask, setActiveTask] = useState<string>("");

    //debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(handler);
    }, [search]);

    // React Query
    const {
        data: tasksData,
        isLoading,
        isError,
    } = useQuery<ProjectTaskResponse, Error>({
        queryKey: ["tasks", projectId, currentPage, limit, debouncedSearch, sort],
        queryFn: () => fetchTasks(projectId, currentPage, limit, debouncedSearch, sort),
        placeholderData: (prev) => prev,
        staleTime: 1000 * 60,
    });
    const tasks = tasksData?.data || [];
    const members = tasksData?.members || [];
    const totalPages = tasksData?.totalPages || 1;
    const TableHeaders =
        tasksData?.userRole !== "member"
            ? ["ID", "Task name", "Priority", "Status", "Assignee", "Due Date", "Edit", "Delete", "View"]
            : ["ID", "Task name", "Priority", "Status", "Assignee", "Due Date", "View"];

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

    const patchTask = useMutation({
        mutationFn: patchUpdate,

        // Optimistic update
        onMutate: async ({ projectId, id, field, value }) => {
            await queryClient.cancelQueries({
                queryKey: ["tasks", projectId, currentPage, limit, debouncedSearch, sort],
            });
            const previousTasks = queryClient.getQueryData<ProjectTaskResponse>([
                "tasks",
                projectId,
                currentPage,
                limit,
                debouncedSearch,
                sort,
            ]);
            queryClient.setQueryData<ProjectTaskResponse>(
                ["tasks", projectId, currentPage, limit, debouncedSearch, sort],
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map((task) => (task._id === id ? { ...task, [field]: value } : task)),
                    };
                }
            );
            return { previousTasks };
        },

        onError: (error, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    ["tasks", variables.projectId, currentPage, limit, debouncedSearch, sort],
                    context.previousTasks
                );
            }
            showSnackBar(`Failed to update: ${error.message}`, "error", 3000);
        },

        onSuccess: (data) => {
            showSnackBar(data || "Task updated successfully!", "success", 3000);
        },

        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["tasks", variables.projectId, currentPage, limit, debouncedSearch, sort],
            });
        },
    });

    const handleOptionChange = (field, id, value) => {
        patchTask.mutate({ projectId, id, field, value });
    };

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

    useEffect(() => {
        if (isLoading) showLoader();
        else hideLoader();
    }, [isLoading]);

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

    const handleTaskClick = (id: string) => {
        setDetailedView(true);
        setActiveTask(id);
    };

    if (isLoading)
        return (
            <div className="centered">
                <p>Loading your tickets</p>
            </div>
        );
    if (isError) return <p>Failed to load tasks</p>;

    return (
        <div className="w-full rounded-2xl space-y-6 lg:space-y-8">
            {/* Sidebar detailed view component */}
            <DvcSideBar active={detailedView} onClose={() => setDetailedView(false)}>
                <DetailedTaskView id={activeTask} />
            </DvcSideBar>

            {/* Project Info */}
            <section className="w-full space-y-3 lg:space-y-4">
                <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">{tasksData?.project.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600">
                    <span>@ {new Date(tasksData?.project.createdAt || "").toLocaleString()}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                        By <span className="font-medium text-gray-900">{tasksData?.project.createdBy.email}</span>
                    </span>
                </div>
            </section>

            {/* Header & Controls */}
            <section className="flex flex-col gap-4 lg:gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Project Tasks</h1>
                        <p className="text-gray-500 font-medium">
                            {tasksData.data.length === 0 ? "No Tasks Available" : "All tasks for this project"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-gray-700">
                            Total Tasks:{" "}
                            <span className="font-bold text-[var(--color-accent)]">{tasksData?.totalTasks || 0}</span>
                        </p>
                        <CheckUserRole userRole={tasksData.userRole}>
                            <button
                                onClick={() => setShowDialog("add")}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-button)] text-white hover:bg-[var(--color-button)]/90 transition-colors shadow-sm"
                            >
                                New Task
                            </button>
                        </CheckUserRole>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-colors"
                        />
                    </div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] transition-colors"
                    >
                        <option value="latest">Latest</option>
                        <option value="oldest">Oldest</option>
                        <option value="my-task">My Tasks</option>
                    </select>
                </div>
            </section>

            {/* Task Table - Responsive Design */}
            {tasksData.data.length > 0 ? (
                <section className="mt-6">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50/80 backdrop-blur-sm">
                                <tr>
                                    {TableHeaders.map((heading) => (
                                        <th
                                            key={heading}
                                            className="py-4 px-6 font-semibold text-left text-gray-900 text-sm"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tasksData.data.map((task) => (
                                    <tr
                                        key={task._id}
                                        className="hover:bg-gray-50/80 transition-colors group"
                                        title={`Assigned By ${task.assigner?.firstName} ${task.assigner?.lastName}`}
                                    >
                                        <td className="py-4 px-6 font-medium text-gray-900">{task.taskId}</td>
                                        <td className="py-4 px-6 max-w-[200px]">
                                            <span className="truncate block" title={task.name}>
                                                {task.name}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`${getPriorityColor(
                                                        task.priority
                                                    )} w-2 h-2 rounded-full`}
                                                ></span>
                                                <select
                                                    name="priority"
                                                    value={task.priority}
                                                    onChange={(e) =>
                                                        handleOptionChange("priority", task._id, e.target.value)
                                                    }
                                                    className="bg-transparent border-0 p-0 text-sm font-medium focus:ring-0 focus:outline-none cursor-pointer"
                                                >
                                                    <option value="urgent">Urgent</option>
                                                    <option value="required">Required</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <select
                                                name="status"
                                                value={task.status}
                                                onChange={(e) => handleOptionChange("status", task._id, e.target.value)}
                                                className="bg-transparent border-0 p-0 text-sm font-medium focus:ring-0 focus:outline-none cursor-pointer"
                                            >
                                                <option value="not-started">Not started</option>
                                                <option value="in-progress">In progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{task.assignee?.email}</td>
                                        <td className="py-4 px-6 text-gray-600">
                                            {task.dueDate &&
                                                new Date(task.dueDate).toLocaleDateString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                        </td>

                                        <CheckUserRole userRole={tasksData.userRole}>
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => handleEdit(task._id)}
                                                    className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </td>
                                            <td className="py-4 px-6">
                                                <button
                                                    onClick={() => openDeleteModel(task._id, task.name)}
                                                    className="p-2 rounded-lg text-red-600 hover:text-red-900 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </CheckUserRole>

                                        <td className="py-4 px-6">
                                            <button
                                                onClick={() => handleTaskClick(task._id)}
                                                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                                                title="View details"
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-3">
                        {tasksData.data.map((task) => (
                            <div
                                key={task._id}
                                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-gray-900">{task.taskId}</h3>
                                        <p className="text-gray-700 text-sm">{task.name}</p>
                                    </div>
                                    <button
                                        onClick={() => handleTaskClick(task._id)}
                                        className="text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <label className="text-gray-500 text-xs">Priority</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className={`${getPriorityColor(task.priority)} w-2 h-2 rounded-full`}
                                            ></span>
                                            <select
                                                name="priority"
                                                value={task.priority}
                                                onChange={(e) =>
                                                    handleOptionChange("priority", task._id, e.target.value)
                                                }
                                                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                                            >
                                                <option value="urgent">Urgent</option>
                                                <option value="required">Required</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-gray-500 text-xs">Status</label>
                                        <select
                                            name="status"
                                            value={task.status}
                                            onChange={(e) => handleOptionChange("status", task._id, e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm mt-1"
                                        >
                                            <option value="not-started">Not started</option>
                                            <option value="in-progress">In progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="text-sm space-y-1">
                                    <p className="text-gray-600">
                                        <span className="text-gray-500">Assigned to: </span>
                                        {task.assignee?.email}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="text-gray-500">Due: </span>
                                        {task.dueDate &&
                                            new Date(task.dueDate).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                    </p>
                                </div>

                                <CheckUserRole userRole={tasksData.userRole}>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleEdit(task._id)}
                                            className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openDeleteModel(task._id, task.name)}
                                            className="flex-1 py-2 px-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </CheckUserRole>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                /* Empty State */
                <div className="w-full py-16 lg:py-24 flex flex-col gap-4 items-center justify-center text-center bg-gray-50/50 rounded-2xl">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                    </div>
                    <div className="space-y-2">
                        <p className="text-gray-900 font-semibold">No tasks found!</p>
                        <p className="text-gray-600">Assign the first task for this project</p>
                    </div>
                    <CheckUserRole userRole={tasksData.userRole}>
                        <button
                            onClick={() => setShowDialog("add")}
                            className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[var(--color-button)] text-white hover:bg-[var(--color-button)]/90 transition-colors shadow-sm"
                        >
                            New Task
                        </button>
                    </CheckUserRole>
                </div>
            )}

            {/* Pagination */}
            {tasksData.data.length > 0 && (
                <section className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Showing page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Previous
                        </button>

                        <div className="flex items-center gap-1">{paginationButtons}</div>

                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                            Next
                        </button>
                    </div>
                </section>
            )}

            {/* Project Team */}
            {members.length > 0 && (
                <section className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Project Team</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex flex-wrap gap-3">
                            {members.map((member) => (
                                <Link to={`/viewprofile/${member._id}`} key={member._id} className="block">
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 hover:bg-gray-100 transition-colors min-w-0">
                                        <div className="flex-shrink-0">
                                            {member.profilePicture ? (
                                                <img
                                                    src={member.profilePicture}
                                                    alt={`${member.firstName} ${member.lastName}`}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-white shadow-sm flex items-center justify-center">
                                                    <span className="text-blue-600 text-sm font-semibold">
                                                        {member.firstName?.[0]}
                                                        {member.lastName?.[0]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
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
                </section>
            )}

            {/* Dialogs */}
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
