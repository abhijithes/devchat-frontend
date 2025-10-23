import { useState } from "react";
import FindUser from "../find-users/FindUser";
import type { Member, Task } from "./TaskTypes";

interface TaskForm {
    onSubmit: (taskData) => void;
    onClose: () => void;
    type: "add" | "edit";
    initialData?: Task;
    members: Member[];
}

export const TaskForm: React.FC<TaskForm> = ({ onSubmit, onClose, type, initialData, members }) => {
    const [task, setTask] = useState({
        taskId: initialData?.taskId ? initialData?.taskId : "",
        name: initialData?.name ? initialData?.name : "",
        priority: initialData?.priority ? initialData?.priority : "required",
        status: initialData?.status ? initialData?.status : "not-started",
        assignee: {
            _id: initialData.assignee._id ?? "",
            email: initialData.assignee.email ?? "",
        },
        dueDate: initialData?.dueDate
            ? new Date(initialData.dueDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
    });
    const handleChange = (field: string, value: string) => {
        setTask((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(task);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 w-full max-w-2xl bg-white mx-auto">
            <h2 className="text-xl font-semibold mb-5">{type === "edit" ? "Edit task" : "Add New Task"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="text-sm text-gray-600">Task ID</label>
                    <input
                        type="text"
                        name="taskId"
                        value={task.taskId}
                        onChange={(e) => handleChange("taskId", e.target.value)}
                        required
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-600">Due Date</label>
                    <input
                        type="date"
                        name="dueDate"
                        value={task.dueDate}
                        onChange={(e) => handleChange("dueDate", e.target.value)}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="text-sm text-gray-600">Task Name</label>
                    <input
                        type="text"
                        name="name"
                        value={task.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-600">Priority</label>
                    <select
                        name="priority"
                        value={task.priority}
                        onChange={(e) => handleChange("priority", e.target.value)}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                    >
                        <option value="urgent">Urgent</option>
                        <option value="required">Required</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <select
                        name="status"
                        value={task.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full bg-gray-50 border rounded-lg px-3 py-2"
                    >
                        <option value="not-started">Not started</option>
                        <option value="in-progress">In progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="text-sm text-gray-600">Assignee</label>
                    <FindUser
                        users={members}
                        selectType="single"
                        onUserSelect={(user: any) => {
                            setTask((prev) => ({
                                ...prev,
                                assignee: user?._id,
                            }));
                            console.log(task);
                        }}
                        activeStyle="bg-zinc-300"
                        inputStyle="bg-gray-50 rounded-lg"
                        defaultValue={task.assignee.email ?? ""}
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={() => onClose()}
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
    );
};
