import { useMutation, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "../../constant/constant";
import api from "../../utils/axios";
import DialogueBox from "../dailogue-box/dialogueBox";
import { TaskForm } from "./TaskForm";
import type { Member, Task } from "./TaskTypes";
import { useSnackBar } from "../snack-bar/snack-bar-context";

interface EditTaskProps {
    onClose: () => void;
    member: Member[];
    initialData: Task;
    projectId: string;
}

const updateTask = async ({ projectId, id, taskData }) => {
    const res = await api.put(endpoints.updateTask(projectId, id), taskData);
    return res.data;
};

export const EditTask: React.FC<EditTaskProps> = ({ onClose, member, projectId, initialData }) => {
    const queryClient = useQueryClient();
    const { showSnackBar } = useSnackBar();

    const mutateTask = useMutation({
        mutationFn: updateTask,
        onError: (error) => showSnackBar(`Updation Failed: ${error}`, "error", 3000),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            showSnackBar("Task Updated Successfully", "success", 3000);
            onClose();
        },
    });

    const onSubmit = async (taskData) => {
        mutateTask.mutate({ projectId, id: initialData._id, taskData });
    };
    const onclose = () => onClose();
    return (
        <DialogueBox onClose={() => onClose()}>
            <TaskForm
                onSubmit={onSubmit}
                onClose={onclose}
                members={member}
                initialData={initialData}
                isLoading={mutateTask.isPending}
            />
        </DialogueBox>
    );
};
