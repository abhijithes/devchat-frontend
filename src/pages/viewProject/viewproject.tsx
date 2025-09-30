import { useEffect, useState } from "react";
import UploadButton from "../../components/buttons/uploudbtn";
import Usericon from "../../components/userIcon/usericon";
import { useParams } from "react-router-dom";
import { endpoints } from "../../constant/constant";
import ProjectDocuments from "../../components/buttons/downloadbtn";
import { useLoader } from "../../contexts/GlobalLoaderContext";

interface AssignedUserType {
    firstName: string;
    email: string;
    _id: string;
    profilePicture?: string;
}
interface ProjectDocument {
    _id?: string;
    name: string;
    description?: string;
    status: "not-started" | "in-progress" | "completed";
    expectedDays?: number;
    createdBy?: string | null;
    assignedUsersData?: AssignedUserType[];
    documents?: {
        fileName: string;
        originalName: string;
        fileUrl: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
}
interface UploadedFile {
    url: string;
    public_id: string;
}

export const Viewproject = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<ProjectDocument | null>(null);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedFile[]>([]);

    const { showLoader, hideLoader }: any = useLoader();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                showLoader();
                const res = await fetch(endpoints.getProjectById(id), {
                    headers: { authorization: `Bearer ${localStorage.getItem("token") || ""}` },
                });
                const data = await res.json();
                setProject(data);
            } catch (err) {
                console.log(err);
            } finally {
                hideLoader();
            }
        };

        if (id) fetchProject();
    }, [id]);

    const handleFileUpload = (file: UploadedFile) => {
        setUploadedDocs((prev) => [...prev, file]); // Add to project documents
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="font-family w-full h-full p-4 md:p-6 lg:p-8  overflow-auto ">
            <div className="top-section">
                <div className="head flex flex-col md:flex-row justify-between gap-4 md:gap-0 sticky top-0">
                    <div className="flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-semibold capitalize">{project.name}</h1>
                        <p className="pt-3 opacity-80 text-base font-medium">
                            {new Date(project.createdAt).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <p className="text-lg sm:text-xl font-semibold">Expected time : {project.expectedDays} Days</p>
                </div>
                <div className="description">
                    <p className="text-base pt-3 opacity-60 mt-5">{project.description}</p>
                </div>
                <h2 className="text-lg font-medium mt-10">Project Documents</h2>
                <ProjectDocuments documents={project.documents} className="my-6" />
                {/* uploud document */}
                <div className="space-y-4">
                    <UploadButton onUploadComplete={handleFileUpload} />

                    {/* List uploaded files */}
                    <div className="mt-4 space-y-2">
                        {uploadedDocs.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between border p-2 rounded">
                                <span className="truncate max-w-xs">{doc.url}</span>
                                <a href={doc.url} download className="text-blue-500 hover:underline text-sm">
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="bottom-section  mt-10 flex flex-col lg:flex-row justify-start w-full gap-6 md:gap-8 lg:gap-10">
                <div className="people border border-zinc-200 p-5 flex flex-col gap-6 justify-between   w-ful h-full lg:w-3/4 pb-6 md:pb-8 lg:pb-10">
                    <div className="contributers">
                        <p className="text-lg sm:text-xl md:text-xl font-semibold">Contributors</p>
                        <div className="allmembers mt-2 md:mt-3 bg-primary p-3">
                            <p className="pb-2 md:pb-3">All members</p>
                            <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-5 pb-3 md:pb-4 lg:pb-5">
                                {project.assignedUsersData?.map((user, index) => (
                                    <Usericon key={index} user={user} />
                                ))}
                                <p className="centered cursor-pointer">
                                    <span className="text-sm">Add more</span>
                                </p>
                            </div>
                        </div>
                        <div className="managers mt-2 md:mt-3 p-3 bg-primary">
                            <p className="pb-2 md:pb-3 ">Managers</p>
                            <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-5 pb-3 md:pb-4 lg:pb-5">
                                <p className="centered cursor-pointer">
                                    <span className="text-sm">Add more</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="groups bg-primary p-3 ">
                        <p className="text-lg sm:text-xl md:text-xl font-semibold">Groups</p>
                        <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-5 pb-3 ">
                            <p className="centered cursor-pointer">
                                <span className="text-sm">Add more</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="tasklist  bg-primary w-full  sm:w-full lg:w-2/5 p-2 md:p-5">
                    <div className="head flex flex-col  flex-wrap sm:flex-row md:justify-between gap-2 sm:gap-0">
                        <h5 className="text-lg sm:text-xl font-medium">Tickets</h5>
                        <div className="colorinfo flex gap-2 md:gap-3 items-center flex-wrap mt-3 lg:mt-0">
                            <div className="flex items-center gap-1">
                                <span className="bg-red-500 w-4 h-4 md:w-5 md:h-5 inline-block rounded hover:bg-red-400"></span>
                                <span className="text-sm md:text-xs">urgent</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="bg-yellow-500 w-4 h-4 md:w-5 md:h-5 inline-block rounded hover:bg-yellow-400"></span>
                                <span className="text-sm md:text-xs">required</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="bg-green-500 w-4 h-4 md:w-5 md:h-5 inline-block rounded hover:bg-green-400"></span>
                                <span className="text-sm md:text-xs">completed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
