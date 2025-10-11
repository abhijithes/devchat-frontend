import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UploadButton from "../../components/buttons/uploudbtn";
import Usericon from "../../components/userIcon/usericon";
import { endpoints } from "../../constant/constant";
import ProjectDocuments from "../../components/projectDocuments/projectDocuments";
import { useLoader } from "../../contexts/GlobalLoaderContext";
import AddUser from "../../components/AddUser/adduser";
import DialogueBox from "../../components/dailogue-box/dialogueBox";
import CheckUserRole from "../../components/check-user-role/CheckUserRole";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssignedUserType {
    firstName: string;
    email: string;
    _id: string;
    profilePicture?: string;
}
interface previewTasks {
    _id: string;
    name: string;
    status: string;
    priority: "urgent" | "required" | "completed";
    taskId: string;
}

interface ProjectDocument {
    _id?: string;
    name: string;
    description?: string;
    status: "not-started" | "in-progress" | "completed";
    expectedDays?: number;
    createdBy?: string | null;
    assignedUsersData?: AssignedUserType[];
    managersData?: AssignedUserType[];
    documents?: {
        fileName: string;
        originalName: string;
        fileUrl: string;
        _id?: String;
    }[];
    createdAt?: string;
    updatedAt?: string;
    userRole?: "member" | "manager" | "owner" | "admin";
}

interface UploadedFile {
    url: string;
    public_id: string;
    originalName: string;
}

export const Viewproject = () => {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { showLoader, hideLoader }: any = useLoader();
    const [showDialogue, setShowDialogue] = useState(false);
    const [AddUserType, setAddUserType] = useState<"member" | "manager">("member");
    const navigate = useNavigate();

    const {
        data: project,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["project", id],
        queryFn: async () => {
            if (!id) throw new Error("Project ID is required");

            showLoader();
            try {
                const res = await fetch(endpoints.getProjectById(id), {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                    },
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch project: ${res.statusText}`);
                }

                const data = await res.json();
                return data as ProjectDocument;
            } finally {
                hideLoader();
            }
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const {
        data: tasksData,
        isLoading: tasksLoading,
        error: tasksError,
    } = useQuery({
        queryKey: ["previewTasks", id],
        queryFn: async () => {
            if (!id) throw new Error("Project ID is required");

            showLoader();
            try {
                const res = await fetch(endpoints.getTaskPreview(id), {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                    },
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch tasks: ${res.statusText}`);
                }

                const data = await res.json();
                return data as previewTasks[];
            } finally {
                hideLoader();
            }
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handleFileUpload = (files: UploadedFile | UploadedFile[]) => {
        const filesArray = Array.isArray(files) ? files : [files];

        // Optimistically update the cache
        if (project && id) {
            const newDocuments = filesArray.map((file) => ({
                fileName: file.public_id,
                originalName: file.originalName,
                fileUrl: file.url,
            }));

            const updatedProject = {
                ...project,
                documents: [...(project.documents || []), ...newDocuments],
            };

            // Update the cache
            queryClient.setQueryData(["project", id], updatedProject);
        }
    };

    const handleNavigateToTasks = () => {
        navigate(`/project/${id}/viewtickets`);
    };
    if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>;

    if (error)
        return (
            <div className="flex justify-center items-center h-64 text-red-600">
                Error: {error instanceof Error ? error.message : "Failed to load project"}
            </div>
        );

    if (!project) return <div className="flex justify-center items-center h-64">Project not found</div>;

    return (
        <div className="font-family w-full h-full p-4 md:p-6 lg:p-8 overflow-auto">
            {/* Header */}
            <div className="top-section">
                <div className="head flex flex-col md:flex-row justify-between gap-4 md:gap-0 sticky top-0 bg-white z-10">
                    <div className="flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-semibold capitalize">{project.name}</h1>
                        <p className="pt-3 opacity-80 text-base font-medium">
                            {new Date(project.createdAt || "").toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <p className="text-lg sm:text-xl font-semibold">Expected time: {project.expectedDays} Days</p>
                </div>

                {/* Description */}
                <div className="description">
                    <p className="text-base pt-3 opacity-60 mt-5">{project.description}</p>
                </div>

                {/* Project Documents */}
                <h2 className="text-lg font-bold mt-10">Project Documents</h2>
                <ProjectDocuments
                    documents={project.documents}
                    className="my-6"
                    ProjectId={project._id}
                    refetch={refetch}
                />

                {/* Upload Documents */}
                <div className="space-y-4">
                    <UploadButton onUploadComplete={handleFileUpload} />
                </div>
            </div>
            {/* Bottom Section */}
            <div className="bottom-section mt-10 flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-10">
                {/* Contributors and Groups */}
                <div className="people border border-zinc-200 p-5 flex flex-col gap-6 w-full lg:w-3/4">
                    <div className="contributers">
                        <p className="text-lg font-semibold">Contributors</p>
                        <div className="allmembers mt-3 bg-primary p-3">
                            <p className="pb-3">All members</p>
                            <div className="flex flex-wrap gap-4 pb-4">
                                {project.assignedUsersData?.map((user, index) => (
                                    <Usericon key={`${user._id}-${index}`} user={user} />
                                ))}
                                <CheckUserRole userRole={project.userRole}>
                                    <p className="centered cursor-pointer">
                                        <span
                                            className="text-sm"
                                            onClick={() => {
                                                setAddUserType("member");
                                                setShowDialogue(true);
                                            }}
                                        >
                                            Add more
                                        </span>
                                    </p>
                                </CheckUserRole>
                            </div>
                        </div>
                        <div className="managers mt-3 p-3 bg-primary">
                            <p className="pb-3">Managers</p>
                            <div className="flex flex-wrap gap-4 pb-4">
                                {project.managersData?.map((user, index) => (
                                    <Usericon key={`${user._id}-${index}`} user={user} />
                                ))}
                                <CheckUserRole userRole={project.userRole}>
                                    <p className="centered cursor-pointer">
                                        <span
                                            className="text-sm"
                                            onClick={() => {
                                                setAddUserType("manager");
                                                setShowDialogue(true);
                                            }}
                                        >
                                            Add more
                                        </span>
                                    </p>
                                </CheckUserRole>
                            </div>
                        </div>
                    </div>

                    <div className="groups bg-primary p-3">
                        <p className="text-lg font-semibold">Groups</p>
                        <div className="flex flex-wrap gap-4 pb-3">
                            <span className="text-xs">No groups found</span>
                            <CheckUserRole userRole={project.userRole}>
                                <p className="centered cursor-pointer">
                                    <span className="text-sm">Add more</span>
                                </p>
                            </CheckUserRole>
                        </div>
                    </div>
                </div>
                {/* add member and groups section end here  */}
                {showDialogue && (
                    <DialogueBox
                        onClose={() => {
                            setShowDialogue(false);
                        }}
                        className="w-[40vw]"
                    >
                        <AddUser
                            projectid={id}
                            usertype={AddUserType}
                            currentMembers={project.assignedUsersData || []}
                        />
                    </DialogueBox>
                )}

                {/* Ticket List  */}
                <div className="tasklist bg-primary w-full lg:w-2/5 p-5 flex flex-col justify-center gap-3">
                    <div className="head flex flex-col sm:flex-row justify-between gap-2">
                        <h5 className="text-lg font-medium">Tickets</h5>
                        <div className="colorinfo flex gap-3 items-center flex-wrap">
                            <div className="flex items-center gap-1">
                                <span className="bg-red-500 w-5 h-5 inline-block rounded"></span>
                                <span className="text-xs">urgent</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="bg-yellow-500 w-5 h-5 inline-block rounded"></span>
                                <span className="text-xs">required</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="bg-green-500 w-5 h-5 inline-block rounded"></span>
                                <span className="text-xs">completed</span>
                            </div>
                        </div>
                    </div>
                    <div className="tasks mt-4 max-h-[300px] flex flex-col">
                        {tasksLoading ? (
                            <div className="flex justify-center items-center h-32">Loading tasks...</div>
                        ) : tasksError ? (
                            <div className="text-red-600">
                                Error: {tasksError instanceof Error ? tasksError.message : "Failed to load tasks"}
                            </div>
                        ) : tasksData && tasksData.length > 0 ? (
                            tasksData.map((task) => (
                                <div
                                    key={task._id}
                                    className={`task p-3 mb-3 border flex justify-between items-center hover:shadow-md cursor-pointer ${
                                        task.priority === "urgent"
                                            ? "border-red-500 "
                                            : task.priority === "required"
                                            ? "border-yellow-500 "
                                            : "border-green-500 "
                                    }`}
                                >
                                    <div
                                        className={`w-5 h-5 mr-3 rounded border-2 ${
                                            task.priority === "urgent"
                                                ? "border-red-300 bg-red-500"
                                                : task.priority === "required"
                                                ? "border-yellow-300 bg-yellow-500"
                                                : "border-green-300 bg-green-500"
                                        }`}
                                    ></div>
                                    <p className="font-semibold ">{task.taskId}</p>
                                    <h6 className="flex-1 ml-3">{task.name}</h6>
                                    <ArrowRight />
                                </div>
                            ))
                        ) : (
                            <div className="text-sm opacity-70 self-center">No tasks found</div>
                        )}
                    </div>

                    <button className="text-blue-500" onClick={handleNavigateToTasks}>
                        {tasksData && tasksData.length > 0 ? "All tasks" : "Add task"}
                    </button>
                </div>
            </div>
        </div>
    );
};
