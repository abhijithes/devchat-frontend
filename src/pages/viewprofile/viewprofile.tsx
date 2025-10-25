import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "../../constant/constant";
import avatar from "../../assets/avatar.jpg";
import ProfileFullView from "../../components/view-profile-picture-component/ProfileFullView";
import { useEffect, useState } from "react";
import { useLoader } from "../../contexts/GlobalLoaderContext";

interface UserType {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    about?: string;
    createdAt: Date;
    location: string;
    socials: any[];
    pinnedProjects: {
        project: {
            _id: string;
            name: string;
            description: string;
            updatedAt: string;
        };
        role: string;
        _id?: string;
    }[];
}

// Fetch user profile function
const fetchUserProfile = async (id: string): Promise<UserType> => {
    const res = await fetch(endpoints.fetchPublicProfile(id), {
        headers: { authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user profile");
    return res.json();
};

export default function ViewProfile() {
    const { id } = useParams<{ id: string }>();
    const [loadProfilePic, setLoadProfilePic] = useState(false);
    const { showLoader, hideLoader } = useLoader();

    const {
        data: user,
        isLoading: isLoadingUser,
        isError: isErrorUser,
        error: userError,
    } = useQuery<UserType, Error>({
        queryKey: ["user", id],
        queryFn: () => fetchUserProfile(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (isLoadingUser) showLoader();
        else hideLoader();
    }, [isLoadingUser]);

    // Loading state
    if (isLoadingUser) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-lg">Loading profile...</div>
            </div>
        );
    }

    // Error state
    if (isErrorUser) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-lg text-red-600">Error: {userError?.message || "Failed to load profile"}</div>
            </div>
        );
    }

    // User not found
    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-lg">User not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  w-full  flex flex-col items-center pb-5 px-6  overflow-y-auto">
            {loadProfilePic && <ProfileFullView src={user.profilePicture} onClose={() => setLoadProfilePic(false)} />}
            {/* Profile Header */}
            <section className="w-full   backdrop-blur-lg rounded-3xl border border-white/40  text-center ">
                <div className="h-max border-light-bottom  p-5  flex gap-5 flex-col md:flex-row items-center space-y-6 ">
                    {/* Avatar */}
                    <div
                        onClick={() => setLoadProfilePic(true)}
                        className="w-40 h-40  rounded-2xl overflow-hidden  border border-zinc-300 bg-gradient-to-br from-yellow-300 to-pink-300"
                    >
                        <img
                            src={user.profilePicture || avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Name + Info */}
                    <div className="text-start">
                        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-gray-500 mt-1">{user?.location}</p>
                        <p className="text-gray-800 font-medium mt-2">
                            Member since{" "}
                            <span className="font-semibold text-gray-900">
                                {new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </p>
                    </div>
                </div>

                {/* About Section */}
                <div className="mt-10 text-left space-y-6   border-light-bottom pb-5">
                    <h2 className="text-lg font-semibold text-gray-900">About me</h2>
                    <p className="text-gray-700 leading-relaxed  whitespace-pre-line">
                        {`${user.about}` || `No mentions.`}
                    </p>

                    {/* Social Media */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Social medias</h2>
                        {user.socials && user.socials.length > 0 ? (
                            <div className="flex flex-wrap gap-4 text-blue-600 font-medium">
                                {user.socials.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:underline"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No social media links</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="w-full mt-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">Active projects</h2>
                <p className="text-gray-500 mb-10">Projects where I’m active</p>

                {user.pinnedProjects.length === 0 ? (
                    <div className="text-center py-20 bg-white/70 rounded-3xl border border-white/40 ">
                        <p className="text-gray-800 text-lg font-medium">No projects found</p>
                        <p className="text-gray-500 text-sm mt-3">
                            Projects you create or are assigned to will appear here
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {user.pinnedProjects.map((project) => (
                            <div
                                key={project._id}
                                className={`bg-gradient-to-br 
                    
                    ${
                        project.role === "owner"
                            ? " from-zinc-200 to-blue-50 text-indigo-800"
                            : " from-zinc-100 to-green-50 text-green-800"
                    }
                    rounded-2xl border border-white/50 p-6 cursor-pointer  hover:scale-[1.02] transition-all duration-300`}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 line-clamp-2">
                                    {project.project.name}
                                </h3>
                                <span
                                    className={`text-xs font-semibold px-4 py-1.5 rounded bg-gradient-to-r ${
                                        project.role === "owner"
                                            ? " from-blue-50 to-zinc-100 text-indigo-800 "
                                            : " from-green-50 to-zinc-200 text-green-800"
                                    }`}
                                >
                                    {project.role === "owner" ? "Owner" : "Assigned"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
