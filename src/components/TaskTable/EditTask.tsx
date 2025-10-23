import { useQueryClient } from "@tanstack/react-query";
import { endpoints } from "../../constant/constant";
import api from "../../utils/axios";
import DialogueBox from "../dailogue-box/dialogueBox";
import { TaskForm } from "./TaskForm";
import type { Member, Task } from "./TaskTypes";

interface EditTaskProps {
    onClose: () => void;
    member: Member[];
    initialData: Task;
    projectId: string;
}

export const EditTask: React.FC<EditTaskProps> = ({ onClose, member, projectId, initialData }) => {
    const queryClient = useQueryClient();
    const onSubmit = async (taskData) => {
        try {
            const res = await api.put(endpoints.updateTask(projectId, initialData._id), taskData);
            console.log("Task Updated:", res.data);
        } catch (error) {
            console.error(error);
        } finally {
            onClose();
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        }
    };
    const onclose = () => onClose();
    return (
        <DialogueBox onClose={() => onClose()}>
            <TaskForm onSubmit={onSubmit} onClose={onclose} type="add" members={member} initialData={initialData} />
        </DialogueBox>
    );
};
