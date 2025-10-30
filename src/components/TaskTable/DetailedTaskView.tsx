import { useQuery } from "@tanstack/react-query";
import { endpoints } from "../../constant/constant";
import api from "../../utils/axios";
import UserIcon from "../userIcon/usericon";
import type { DetailedTaskView, Task } from "./TaskTypes";

interface DetailedTaskViewProps {
    id: string;
}

const gettaskDetails = async (id) => {
    console.log(id.id);
    const res = await api.get<Task>(endpoints.getTaskData(id));
    return res.data;
};

const DetailedTaskView: React.FC<DetailedTaskViewProps> = ({ id }) => {
    const { data, isLoading, isError, error } = useQuery<DetailedTaskView, Error>({
        queryKey: ["taskDetails", id],
        queryFn: () => gettaskDetails(id),
        enabled: !!id,
    });
    return (
        <div className="pb-8">
            <p className="font-semibold">{data?._id}</p>
            <h1 className="text-xl">{data?.name}</h1>
            <p className="mt-2 text-zinc-500">No detailed description mentioned</p>
            <br />
            <div className="flex-left gap-3">
                <div className="w-4 h-4 bg-black rounded-sm border-2 border-zinc-300"></div>
                <p>{data?.priority}</p>{" "}
            </div>
            <div className="flex-left gap-3">
                <div className="w-4 h-4 bg-black rounded-sm border-2 border-zinc-300"></div>
                <p>{data?.status}</p>
            </div>
            <br />
            <p>
                {data?.dueDate &&
                    new Date(data.dueDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
            </p>
            <br />
            {data?.assignee && (
                <div className="mt-5">
                    <h1 className="sub-heading">Assignee</h1>
                    <div className="flex-left gap-2 mt-3">
                        {data.assignee && <UserIcon user={data?.assignee} />}
                        <h3 className="flex flex-col ">
                            {data?.assignee?.firstName} {data?.assignee?.lastName}
                            <p className="text-sm">{data?.assignee?.email}</p>
                        </h3>
                    </div>
                </div>
            )}

            {data?.assigner && (
                <div className="mt-5">
                    <h1 className="sub-heading">Assigner</h1>
                    <div className="flex-left gap-2 mt-3">
                        {data.assigner && <UserIcon user={data?.assigner} />}
                        <h3 className="flex flex-col ">
                            {data?.assigner?.firstName} {data?.assigner?.lastName}
                            <p className="text-sm">{data?.assigner?.email}</p>
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
                    {["Comment one", "Comment two"].map((data, _index) => (
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
