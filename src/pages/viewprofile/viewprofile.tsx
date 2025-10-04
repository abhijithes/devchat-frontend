import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { endpoints } from "../../constant/constant";
import avatar from "../../assets/avatar.jpg";

interface UserType {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    about?: string;
    createdAt: Date;
}

export default function viewprofile() {
    const { id } = useParams<{ id: string }>();
    const [user, setuser] = useState<UserType | null>(null);
    const [projects, setProjects] = useState<any>([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await fetch(endpoints.getUserById(id), {
                    headers: { authorization: `Bearer ${localStorage.getItem("token") || ""}` },
                });
                const data = await res.json();
                setuser(data);
                console.log(data);
                // Handle user data
            } catch (err) {
                console.log(err);
            }
        };

        fetchUserProfile();
        const fetchUserProjects = async () => {
            try {
                const res = await fetch(endpoints.getAllProjectNames, {
                    headers: { authorization: `Bearer ${localStorage.getItem("token") || ""}` },
                });
                const data = await res.json();
                console.log(data);
                setProjects(data);
                // Handle user data
            } catch (err) {
                console.log(err);
            }
        };

        fetchUserProjects();
    }, [id]);
    if (!user) return <div>Loading...</div>;
    return (
        <div className="flex flex-col lg:flex-row w-full gap-6 p-4">
            <section className="profile-card bg-white rounded-xl p-6 w-full lg:max-w-sm">
                <div className="profile-header flex flex-col items-center text-center mb-6">
                    <div className="avatar-wrapper relative mb-4">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-100 overflow-hidden">
                            <img
                                src={user.profilePicture || avatar}
                                alt={`${user.firstName} ${user.lastName}'s profile`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800">
                        {user.firstName} {user.lastName}
                    </h1>
                </div>

                <div className="profile-details space-y-4">
                    <div className="detail-item">
                        <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                        <p className="text-gray-800 break-words">{user.email}</p>
                    </div>

                    <div className="detail-item">
                        <label className="text-sm font-medium text-gray-500 block mb-1">Member Since</label>
                        <p className="text-gray-800">
                            {new Date(user?.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>

                    <div className="detail-item">
                        <label className="text-sm font-medium text-gray-500 block mb-1">About</label>
                        <p className="text-gray-800 leading-relaxed">{user.about || "No bio provided"}</p>
                    </div>
                </div>
            </section>

            <section className="projects-section flex-1">
                <div className="projects-content bg-white rounded-xl  border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Projects</h2>
                    <div className="projects-grid">
                        {projects.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No projects found</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.assignedProjects?.map((project, i) => (
                                    <div
                                        key={i}
                                        className="project-card bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => (window.location.href = `/project/${project._id}`)}
                                    >
                                        <h3 className="text-base font-medium text-gray-800 mb-1">{project.name}</h3>
                                        <span className="text-xs text-blue-600 font-medium">Assigned</span>
                                    </div>
                                ))}
                                {projects.projects?.map((project, i) => (
                                    <div
                                        key={i}
                                        className="project-card bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => (window.location.href = `/project/${project._id}`)}
                                    >
                                        <h3 className="text-base font-medium text-gray-800">{project.name}</h3>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
