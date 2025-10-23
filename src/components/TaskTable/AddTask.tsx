import { useQueryClient } from "@tanstack/react-query";
import { endpoints } from "../../constant/constant";
import api from "../../utils/axios";
import DialogueBox from "../dailogue-box/dialogueBox";
import { TaskForm } from "./TaskForm";
import type { Member } from "./TaskTypes";

interface AddTaskProps {
    onClose: () => void;
    member: Member[];
    projectId: string;
}
export const AddTask: React.FC<AddTaskProps> = ({ onClose, member, projectId }) => {
    const queryClient = useQueryClient();
    const onSubmit = async (taskData) => {
        try {
            const res = await api.post(endpoints.createTask(projectId), taskData);
            console.log("Task created:", res.data);
        } catch (error) {
            console.error(error);
        } finally {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            onClose();
        }
    };
    const onclose = () => onClose();
    return (
        <DialogueBox onClose={() => onClose()}>
            <TaskForm onSubmit={onSubmit} onClose={onclose} type="add" members={member} />
        </DialogueBox>
    );
};
