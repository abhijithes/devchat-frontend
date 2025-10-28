import UserIcon from "../userIcon/usericon";
import type { Task } from "./TaskTypes";

const DetailedTaskView = (task: Task | null) => {
  return (
    <div className="pb-8">
      <p className="font-semibold">{task?.taskId}</p>
      <h1 className="text-xl">{task?.name}</h1>
      <p className="mt-2 text-zinc-500">No detailed description mentioned</p>
      <br />
      <div className="flex-left gap-3">
        <div className="w-4 h-4 bg-black rounded-sm border-2 border-zinc-300"></div>
        <p>{task?.priority}</p>{" "}
      </div>
      <div className="flex-left gap-3">
        <div className="w-4 h-4 bg-black rounded-sm border-2 border-zinc-300"></div>
        <p>{task?.status}</p>
      </div>
      <br />
      <p>
        {task?.dueDate &&
          new Date(task.dueDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
      </p>
      <br />
      {task?.assignee && (
        <div className="mt-5">
          <h1 className="sub-heading">Assignee</h1>
          <div className="flex-left gap-2 mt-3">
            {task.assignee && <UserIcon user={task?.assignee} />}
            <h3 className="flex flex-col ">
              {task?.assignee?.firstName} {task?.assignee?.lastName}
              <p className="text-sm">{task?.assignee?.email}</p>
            </h3>
          </div>
        </div>
      )}

      {task?.assigner && (
        <div className="mt-5">
          <h1 className="sub-heading">Assigner</h1>
          <div className="flex-left gap-2 mt-3">
            {task.assigner && <UserIcon user={task?.assigner} />}
            <h3 className="flex flex-col ">
              {task?.assigner?.firstName} {task?.assigner?.lastName}
              <p className="text-sm">{task?.assigner?.email}</p>
            </h3>
          </div>
        </div>
      )}
      <br />
      <h1 className="sub-heading ">Documents and files attached</h1>
      <div className="w-full min-h-40 bg-zinc-50 mt-5 rounded-2xl grid place-items-center">
        <span className="null-value-text">No docs found!</span>
      </div>

      <br />
      <div>
        <div className="w-full flex items-center justify-between">
          <h1 className="sub-heading">Comments</h1>
          <button className="w-24 h-8 bg-black text-white rounded-md hover:scale-95 hover:bg-zinc-700 cursor-pointer  ">
            New
          </button>
        </div>
        <div className="mt-5">
          {["Comment one", "Comment two"].map((data, index) => (
            <div>
              <h1>{data}</h1>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailedTaskView;
