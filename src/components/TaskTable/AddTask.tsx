import { useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "../../constant/constant";
import api from "../../utils/axios";
import DialogueBox from "../dailogue-box/dialogueBox";
import { TaskForm } from "./TaskForm";
import type { Member } from "./TaskTypes";
import { useSnackBar } from "../snack-bar/snack-bar-context";

interface AddTaskProps {
    onClose: () => void;
    member: Member[];
    projectId: string;
}

const createTask = async ({ projectId, taskData }) => {
    const res = await api.post(endpoints.createTask(projectId), taskData);
    return res.data;
};
export const AddTask: React.FC<AddTaskProps> = ({ onClose, member, projectId }) => {
    const queryClient = useQueryClient();
    const { showSnackBar } = useSnackBar();
    const mutation = useMutation({
        mutationFn: createTask,
        onError: (error) => {
            showSnackBar(`Task Creation Failed: ${error}`, "error", 3000);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            showSnackBar("Task Created Successfully", "success", 3000);
            onClose();
        },
    });
    const onSubmit = (taskData) => {
        mutation.mutate({ projectId, taskData });
    };
    const onclose = () => onClose();
    return (
        <DialogueBox onClose={() => onClose()}>
            <TaskForm onSubmit={onSubmit} onClose={onclose} members={member} isLoading={mutation.isPending} />
        </DialogueBox>
    );
};
