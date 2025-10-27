import UserIcon from "../userIcon/usericon";
import type { Task } from "./TaskTypes";

const DetailedTaskView = (task: Task) => {
  return (
    <div>
      <p className="font-semibold">{task.taskId}</p>
      <h1 className="text-xl">{task.name}</h1>
      <p className="mt-2 text-zinc-500">No detailed description mentioned</p>
      <br />
      <div className="flex-left gap-5">
        <p>{task.priority}</p>
        <p>{task.status}</p>
      </div>
      <br />
      <p>
        {task.dueDate &&
          new Date(task.dueDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
      </p>
      <br />
      <div>
        <h1 className="sub-heading">Assignee</h1>
        <h3 className="flex">
          <UserIcon user={task.assignee} />
          {task.assignee.firstName} {task.assignee.lastName}
        </h3>
      </div>
    </div>
  );
};

export default DetailedTaskView;
