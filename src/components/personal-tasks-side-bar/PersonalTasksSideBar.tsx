import { usePersonalTasks } from "../../contexts/PersonalTasksContext";
import PersonalTasks from "../../pages/personal-tasks/PersonalTasks";
import DvcSideBar from "../dvc-side-bar/DvcSideBar";

const PersonalTasksSideBar = () => {
  const { window, setWindow } = usePersonalTasks();
  return (
    <DvcSideBar
      active={window}
      onClose={() => setWindow(false)}
      title="Personal Tasks"
    >
      <PersonalTasks />
    </DvcSideBar>
  );
};

export default PersonalTasksSideBar;
