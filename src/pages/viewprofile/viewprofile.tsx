import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
    // const [projects, setProjects] = useState<{ _id: string; name: string; role: string; updatedAt: string }[]>([]);

    // TanStack Query for user profile
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
        <div className="flex flex-col lg:flex-row w-full gap-4 md:gap-6 p-4 md:p-6">
            {/* Profile Card */}
            <section className="profile-card bg-white rounded-xl p-4 md:p-6 w-full lg:max-w-sm  border border-gray-100">
                <div className="profile-header flex flex-col items-center text-center mb-6">
                    <div className="avatar-wrapper relative mb-4">
                        <div className="w-28 h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full border-4 border-blue-50 overflow-hidden">
                            <img
                                src={user.profilePicture || avatar}
                                alt={`${user.firstName} ${user.lastName}'s profile`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                        {user.firstName} {user.lastName}
                    </h1>
                </div>

                <div className="profile-details space-y-4">
                    <div className="detail-item">
                        <label className="text-sm font-medium text-gray-500 block mb-1">Email</label>
                        <p className="text-gray-800 break-words text-sm md:text-base">{user.email}</p>
                    </div>

                    <div className="detail-item">
                        <label className="text-sm font-medium text-gray-500 block mb-1">Member Since</label>
                        <p className="text-gray-800 text-sm md:text-base">
                            {new Date(user.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>

                    <div className="detail-item">
                        <label className="text-sm font-medium text-gray-500 block mb-1">About</label>
                        <p className="text-gray-800 leading-relaxed text-sm md:text-base">
                            {user.about || "No bio provided"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="projects-section flex-1">
                <div className="projects-content bg-white rounded-xl border border-gray-100 p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Projects</h2>

                    <div className="projects-grid">
                        {user.pinnedProjects.length === 0 ? (
                            <p className="text-gray-500 text-center py-8 text-sm md:text-base">No projects found</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                                {user.pinnedProjects.map((project) => (
                                    <div
                                        key={`owned-${project._id}`}
                                        className="project-card bg-white border border-gray-200 rounded-lg p-4 md:p-5 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <h3 className="text-sm md:text-base font-medium text-gray-800 line-clamp-2">
                                            {project.project.name}
                                        </h3>
                                        <span className="text-xs text-black font-medium bg-blue-50 px-2 py-1 rounded">
                                            {project.role === "owner" ? "owned" : "assigned"}
                                        </span>
                                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 rounded-lg pointer-events-none" />
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
