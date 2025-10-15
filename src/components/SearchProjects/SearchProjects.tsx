import { Search } from "lucide-react";
import DialogueBox from "../dailogue-box/dialogueBox";
import { useEffect, useState } from "react";
import { endpoints } from "../../constant/constant";
import axios from "axios";
import { useSnackBar } from "../snack-bar/snack-bar-context";

interface UserType {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    about?: string;
    createdAt: string;
    updatedAt: string;
    pinnedProjects: [
        {
            project: {
                _id: String;
                updatedAt: String;
                name: String;
                description: String;
            };
            role: String;
            _id: String;
        }
    ];
    createdProjects: [
        {
            _id: String;
            updatedAt: String;
            name: String;
            description: String;
        }
    ];
    assignedProjects: [
        {
            _id: String;
            updatedAt: String;
            name: String;
            description: String;
        }
    ];
}

export const SearchProjects = ({
    setShowPinProjects,
    user,
    refetch,
}: {
    setShowPinProjects;
    user: UserType;
    refetch: () => void;
}) => {
    const [allprojects, setAllProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const showSnackBar = useSnackBar();

    useEffect(() => {
        const project = [...user.createdProjects, ...user.assignedProjects];
        const filteredProj = project.map((project) => {
            const checked = user.pinnedProjects.some((data) => data.project._id === project._id);
            return { project: project, checked };
        });
        const sorted = filteredProj.sort((a, b) => {
            if (a.checked === b.checked) return 0;
            return a.checked ? -1 : 1;
        });
        setAllProjects(sorted);
        setFilteredProjects(sorted);
    }, [user]);

    const handleSearch = (value) => {
        if (value === "") {
            setFilteredProjects(allprojects);
            return;
        }
        const lower = value.toLowerCase();
        const filteredProjects = allprojects.filter((project) => {
            return project.project.name.toLowerCase().includes(lower) || project.checked;
        });
        setFilteredProjects(filteredProjects);
    };

    const handleCheck = (id) => {
        const checkedCount = filteredProjects.filter((p) => p.checked).length;

        const updated = filteredProjects.map((project) => {
            if (project.project._id === id) {
                if (!project.checked && checkedCount >= 6) {
                    alert("You can only pin up to 6 projects.");
                    return project;
                }
                return { ...project, checked: !project.checked };
            }
            return project;
        });

        setFilteredProjects(updated);
    };

    const handleSubmit = async () => {
        try {
            const pinnedproj = filteredProjects.filter((project) => project.checked === true);
            const body = pinnedproj.map((project) => {
                if (user.createdProjects.some((data) => data._id === project.project._id)) {
                    return { project: project.project._id, role: "owner" };
                } else {
                    return { project: project.project._id, role: "member" };
                }
            });
            const res = await axios.put(
                endpoints.updatePinnedProj(user._id),
                {
                    projects: body,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                    },
                }
            );
            await refetch();
            setShowPinProjects(false);
            showSnackBar.showSnackBar("Pinned projects updated successfully", "success", 3000);
            return res.data;
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <DialogueBox onClose={() => setShowPinProjects(false)} className="sm:min-w-120" heading="Edit pinned projects">
            <div className="w-full h-120 flex flex-col">
                <p className="text-sm max-w-[80%] text-gray-700">
                    Select up to six projects you'd like to show to anyone.
                </p>
                <div className="relative h-8 mb-5">
                    <input
                        type="text"
                        className="h-full w-full my-2 px-2 pl-8 border border-accent rounded-sm focus:outline-0"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Search className=" absolute left-1 top-1/2 -translate-y-1/5" color="gray" />
                </div>
                <div className="h-90 overflow-auto">
                    {filteredProjects.map((project, index) => (
                        <div className="mb-2 flex items-center" key={index}>
                            <input
                                type="checkbox"
                                name="project"
                                // id={project._id}
                                className="mr-2 w-4 h-4"
                                checked={project.checked}
                                // disabled={selectedProjects.length >= 6}
                                onClick={() => handleCheck(project.project._id)}
                            />
                            <svg
                                aria-hidden="true"
                                height="16"
                                viewBox="0 0 16 16"
                                version="1.1"
                                width="16"
                                data-view-component="true"
                                className="octicon octicon-repo mr-1 color-fg-muted"
                            >
                                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                            </svg>
                            <p className="flex-1">{project.project.name}</p>
                        </div>
                    ))}
                </div>
                <button
                    className="bg-accent py-2 px-3 rounded-sm text-white max-w-30 font-semibold self-end"
                    onClick={handleSubmit}
                >
                    Save pins
                </button>
            </div>
        </DialogueBox>
    );
};
