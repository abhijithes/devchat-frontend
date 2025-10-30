import { useQuery } from "@tanstack/react-query";
import { endpoints } from "../../constant/constant";
import api from "../../utils/axios";
import UserIcon from "../userIcon/usericon";
import type { DetailedTaskViewType } from "./TaskTypes";
import { getPriorityColor } from "./TaskTable";
interface DetailedTaskViewProps {
    id: string;
}

const gettaskDetails = async (id) => {
    console.log(id.id);
    const res = await api.get<DetailedTaskViewType>(endpoints.getTaskData(id));
    return res.data;
};

export const DetailedTaskView: React.FC<DetailedTaskViewProps> = ({ id }) => {
    const { data, isLoading, isError, error } = useQuery<DetailedTaskViewType, Error>({
        queryKey: ["taskDetails", id],
        queryFn: () => gettaskDetails(id),
        enabled: !!id,
    });
    return (
        <div className="pb-8">
            <p className="font-semibold">{data?.ticket.taskId}</p>
            <h1 className="text-xl">{data?.ticket.name}</h1>
            <p className="mt-2 text-zinc-500">No detailed description mentioned</p>
            <br />
            <div className="flex-left gap-3">
                <div className={`bg-amber-400 w-3 h-3 rounded-sm`}></div>
                <p>{data?.ticket.status}</p>
            </div>
            <div className="flex-left gap-3">
                <div className={`${getPriorityColor(data.ticket.priority)} w-3 h-3 rounded-sm`}></div>
                <p>{data?.ticket.priority}</p>
            </div>
            <br />
            <p>
                {data?.ticket.dueDate &&
                    new Date(data.ticket.dueDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
            </p>
            <br />
            {data?.ticket.assignee && (
                <div className="mt-5">
                    <h1 className="sub-heading">Assignee</h1>
                    <div className="flex-left gap-2 mt-3">
                        {data.ticket.assignee && <UserIcon user={data?.ticket.assignee} />}
                        <h3 className="flex flex-col ">
                            {data?.ticket.assignee?.firstName} {data?.ticket.assignee?.lastName}
                            <p className="text-sm">{data?.ticket.assignee?.email}</p>
                        </h3>
                    </div>
                </div>
            )}

            {data?.ticket.assigner && (
                <div className="mt-5">
                    <h1 className="sub-heading">Assigner</h1>
                    <div className="flex-left gap-2 mt-3">
                        {data.ticket.assigner && <UserIcon user={data?.ticket.assigner} />}
                        <h3 className="flex flex-col ">
                            {data?.ticket.assigner?.firstName} {data?.ticket.assigner?.lastName}
                            <p className="text-sm">{data?.ticket.assigner?.email}</p>
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
                <div className="mt-8">
                    {data?.ticket.comments.length === 0 && <span className="null-value-text">No comments found!</span>}
                    {data?.ticket.comments.map((data, _index) => (
                        <div className="border-b border-zinc-200 pb-4 mb-4 last:border-0" key={_index}>
                            <div className="flex-left gap-2 mb-3">
                                <UserIcon user={data.creator} />
                                <p className="text-zinc-700">{data.creator.email}</p>
                            </div>
                            <h1 className="ml-13">{data.comment}</h1>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DetailedTaskView;
