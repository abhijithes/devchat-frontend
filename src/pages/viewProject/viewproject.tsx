import { useEffect, useState } from "react";
import UploadButton from "../../components/buttons/uploudbtn";
import Usericon from "../../components/userIcon/usericon";
import { useParams } from "react-router-dom";
import { dev_api_url } from "../../constant/constant";
import ProjectDocuments from "../../components/buttons/downloadbtn";

interface ProjectDocument {
    _id?: string;
    name: string;
    description?: string;
    status: "not-started" | "in-progress" | "completed";
    expectedDays?: number;
    createdBy?: string | null;
    assignedUsers?: string[];
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

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`${dev_api_url}/api/projects/${id}`, {
                    headers: { authorization: `Bearer ${localStorage.getItem("token") || ""}` },
                });
                const data = await res.json();
                setProject(data);
            } catch (err) {
                console.log(err);
            }
        };

        if (id) fetchProject();
    }, [id]);

    const handleFileUpload = (file: UploadedFile) => {
        setUploadedDocs((prev) => [...prev, file]); // Add to project documents
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="font-family w-full h-full p-4 md:p-6 lg:p-8 xl:p-25">
            <div className="top-section">
                <div className="head flex flex-col md:flex-row justify-between gap-4 md:gap-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl">{project.name}</h1>
                    <p className="text-lg sm:text-xl font-semibold">Expected time : {project.expectedDays} Days</p>
                </div>
                <div className="description">
                    <p className="text-base sm:text-lg md:text-xl pt-6 md:pt-8 lg:pt-10">{project.description}</p>
                </div>
                <h2 className="text-lg font-bold mt-10">Project Documents</h2>
                <ProjectDocuments documents={project.documents} />
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
            <div className="bottom-section flex flex-col lg:flex-row justify-between w-full gap-6 md:gap-8 lg:gap-10">
                <div className="people flex flex-col gap-6 md:gap-8 lg:gap-10 w-full lg:w-1/2 pb-6 md:pb-8 lg:pb-10">
                    <div className="contributers">
                        <p className="text-lg sm:text-xl md:text-xl font-semibold">Contributors</p>
                        <div className="allmembers m-2 md:m-3 bg-primary">
                            <p className="pb-2 md:pb-3">All members</p>
                            <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-5 pb-3 md:pb-4 lg:pb-5">
                                {project.assignedUsers.map((user, index) => (
                                    <Usericon key={index} id={user} />
                                ))}
                                <p className="centered cursor-pointer">
                                    <span className="text-sm">Add more</span>
                                </p>
                            </div>
                        </div>
                        <div className="managers m-2 md:m-3">
                            <p className="pb-2 md:pb-3 bg-primary">Managers</p>
                            <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-5 pb-3 md:pb-4 lg:pb-5">
                                <p className="centered cursor-pointer">
                                    <span className="text-sm">Add more</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="groups">
                        <p className="text-lg sm:text-xl md:text-xl font-semibold">Groups</p>
                        <div className="flex flex-wrap gap-3 md:gap-4 lg:gap-5 pb-3 md:pb-4 lg:pb-5 m-2 md:m-3">
                            <p className="centered cursor-pointer">
                                <span className="text-sm">Add more</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="tasklist bg-amber-300 w-full lg:w-2/5 p-2 md:p-3">
                    <div className="head flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                        <h5 className="text-lg sm:text-xl">Tickets</h5>
                        <div className="colorinfo flex gap-2 md:gap-3 items-center flex-wrap">
                            <div className="flex items-center gap-1">
                                <span className="bg-red-500 w-4 h-4 md:w-5 md:h-5 inline-block rounded"></span>
                                <span className="text-sm md:text-base">urgent</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="bg-yellow-500 w-4 h-4 md:w-5 md:h-5 inline-block rounded"></span>
                                <span className="text-sm md:text-base">required</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="bg-green-500 w-4 h-4 md:w-5 md:h-5 inline-block rounded"></span>
                                <span className="text-sm md:text-base">completed</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
