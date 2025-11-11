import { useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { current_url, endpoints } from "../../constant/constant";
import { jwtDecode } from "jwt-decode";
import avatar from "../../assets/avatar.jpg";
import { CircularProgress } from "@mui/material";
import { Edit, Save, Cancel, CloudUpload } from "@mui/icons-material";
import { useSnackBar } from "../../components/snack-bar/snack-bar-context";
import { Pinnedprojects } from "../../components/pinnedprojects/pinnedprojects";
import { setUserPublicInfo } from "../../utils/token";
import { Link } from "react-router-dom";
import { ChevronsRight } from "lucide-react";

interface UserType {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    about?: string;
    createdAt: string;
    updatedAt: string;
    location?: string;
    socials?: Array<{ field: string; link: string }>;
    pinnedProjects: [
        {
            project: {
                _id: string;
                updatedAt: string;
                name: string;
                description: string;
            };
            role: string;
            _id: string;
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

interface UploadResponse {
    files: Array<{ url: string }>;
}

interface JwtPayload {
    id: string;
}

// Fetch user profile function
const fetchUserProfile = async (id: string): Promise<UserType> => {
    const res = await fetch(endpoints.getUserWithProjects(id), {
        headers: {
            authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
    });
    if (!res.ok) throw new Error("Failed to fetch user profile");
    return res.json();
};

// Update user profile function
const updateUserProfile = async ({ id, userData }: { id: string; userData: Partial<UserType> }): Promise<UserType> => {
    const res = await fetch(`${current_url}/users/update/${id}`, {
        method: "PATCH",
        body: JSON.stringify(userData),
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
    });
    if (!res.ok) throw new Error("Failed to update profile");
    return res.json();
};

// Upload file function
const uploadFile = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch(`${current_url}/upload`, {
        method: "POST",
        body: formData,
        headers: {
            authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
};

export default function Profile() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(avatar);
    const [editableFields, setEditableFields] = useState({
        firstName: false,
        lastName: false,
        email: false,
        about: false,
        location: false,
        socials: false,
    });
    const queryClient = useQueryClient();
    const { showSnackBar } = useSnackBar();
    // Get user ID from token
    const jwttoken = localStorage.getItem("token");
    if (!jwttoken) {
        window.location.href = "/login";
        return null;
    }

    const decoded = jwtDecode(jwttoken) as JwtPayload;
    const { id } = decoded;

    // TanStack Query for user profile
    const {
        data: user,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery<UserType, Error>({
        queryKey: ["user", id],
        queryFn: () => fetchUserProfile(id),
        enabled: !!id,
    });

    // Mutation for updating user profile
    const updateProfileMutation = useMutation<UserType, Error, { id: string; userData: Partial<UserType> }>({
        mutationFn: updateUserProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(["user", id], data);
            setEditableFields({
                firstName: false,
                lastName: false,
                email: false,
                about: false,
                location: false,
                socials: false,
            });
            setUserPublicInfo({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                profilePicture: data.profilePicture,
            });
        },
        onError: (error: Error) => {
            console.error("Error updating profile:", error.message);
        },
    });

    // Mutation for uploading profile picture
    const uploadPfpMutation = useMutation<string, Error, File>({
        mutationFn: async (file: File): Promise<string> => {
            setPreview(URL.createObjectURL(file));
            const uploadResult = await uploadFile(file);
            const pfpUrl = uploadResult.files[0].url;

            await updateProfileMutation.mutateAsync({
                id,
                userData: { profilePicture: pfpUrl },
            });
            showSnackBar("Please relogin to affect navigation image!", "info", 5000);

            return pfpUrl;
        },
        onError: (error: Error) => {
            console.error("Error uploading profile picture:", error.message);
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadPfpMutation.mutate(file);
        }
    };

    const handleEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        queryClient.setQueryData(["user", id], (oldData: UserType | undefined) => {
            if (!oldData) return oldData;

            const match = name.match(/^socials\[(\d+)\]\.(\w+)$/);

            // Check if the name belongs to socials array
            if (match) {
                const index = parseInt(match[1]);
                const key = match[2];
                const updatedSocials = [...(oldData.socials || [])];
                updatedSocials[index] = { ...updatedSocials[index], [key]: value };
                return { ...oldData, socials: updatedSocials };
            }

            //  Otherwise handle top-level fields normally
            return { ...oldData, [name]: value };
        });
    };

    const handleSubmit = () => {
        if (user) {
            updateProfileMutation.mutate({ id, userData: user });
        }
    };

    const handleReset = () => {
        // Refetch original data to reset changes
        queryClient.invalidateQueries({ queryKey: ["user", id] });
        setEditableFields({
            firstName: false,
            lastName: false,
            email: false,
            about: false,
            location: false,
            socials: false,
        });
    };

    // Check if there are unsaved changes by comparing with server data
    const hasChanges = user || queryClient.getQueryData(["user", id]) !== user;

    //  socio link edit section

    const handleAddSocial = () => {
        queryClient.setQueryData(["user", id], (oldData: UserType | undefined) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                socials: [...(oldData.socials || []), { field: "", link: "" }],
            };
        });
    };

    const handleRemoveSocial = (index: number) => {
        queryClient.setQueryData(["user", id], (oldData: UserType | undefined) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                socials: oldData.socials.filter((_, i) => i !== index),
            };
        });
    };
    // Set preview when user data loads
    useEffect(() => {
        if (user?.profilePicture) {
            setPreview(user.profilePicture);
        }
    }, [user?.profilePicture]);

    const handleChangePins = async () => {
        await refetch();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="w-full h-full flex justify-center items-center p-4">
                <div className="flex items-center gap-3 text-gray-600">
                    <CircularProgress size={24} />
                    <p className="text-lg">Loading user profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (isError || !user) {
        return (
            <div className="w-full h-full flex justify-center items-center p-4">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">{error?.message || "Failed to load user profile"}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-black text-white px-6 py-2 rounded-lg font-semibold"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="w-full mx-auto ">
                {/* Profile Header */}
                <div className="bg-gradient-to-l from-zinc-50 to-white rounded-t-2xl border border-b-0 border-gray-100 p-3 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Profile Picture */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-xl border-4 border-white overflow-hidden">
                                <img
                                    src={user.profilePicture || preview || avatar}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                                {(uploadPfpMutation.isPending || updateProfileMutation.isPending) && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <CircularProgress size={30} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-zinc-800 to-zinc-600 text-white p-2 rounded-full hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                disabled={uploadPfpMutation.isPending}
                            >
                                <CloudUpload className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                className="hidden"
                                ref={inputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-gray-600 mb-3 flex items-center justify-center md:justify-start gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Member since{" "}
                                {new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                            <p className="text-gray-700 leading-relaxed text-left">
                                {user.about || "No bio yet. Write something about yourself!"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* view in public mode */}
                <div className="p-5 px-8 border border-zinc-100 space-y-3 group ">
                    {/* <h1 className="text-lg font-semibold">View your public profile</h1> */}
                    <Link
                        className=" w-max flex gap-2 items-center  text-cliped-gradient-blue  "
                        to={`/viewprofile/${user._id}/?isViewMode=true`}
                    >
                        <ChevronsRight size={17} className="text-blue-500 group-hover:translate-x-1 transition-all" />
                        View in public mode
                    </Link>
                </div>

                {/* Edit Profile Form */}
                <div className="bg-white border border-t-0 border-gray-100 p-2 sm:p-4 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900">Edit Profile</h2>
                        <div className="flex gap-3">
                            <button
                                onClick={handleReset}
                                disabled={!hasChanges || updateProfileMutation.isPending}
                                className={`flex items-center gap-2 px-2 md:px-4 md:py-2 rounded-lg border transition-all duration-200 ${
                                    hasChanges && !updateProfileMutation.isPending
                                        ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                                        : "border-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                <Cancel className="w-5 h-5" />
                                Reset
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!hasChanges || updateProfileMutation.isPending}
                                className={`flex items-center gap-2 px-2 md:px-4 py-2 rounded-lg transition-all duration-200 ${
                                    hasChanges && !updateProfileMutation.isPending
                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:transform hover:scale-105"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                <Save className="w-5 h-5" />
                                {updateProfileMutation.isPending ? (
                                    "Saving..."
                                ) : (
                                    <>
                                        Save <span className="hidden md:block">Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 md:space-y-6 max-w-full">
                        {/* First Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center md:gap-4 p-4 rounded-xl border border-zinc-200 transition-colors duration-200 max-w-full">
                            <label className="text-base md:text-lg font-semibold text-gray-700 sm:min-w-[120px]">
                                First Name
                            </label>
                            <div className="flex-1 flex items-center gap-3">
                                <input
                                    type="text"
                                    maxLength={30}
                                    value={user.firstName}
                                    name="firstName"
                                    onChange={handleEdit}
                                    className={`flex-1 bg-transparent text-lg outline-none transition-all duration-200 ${
                                        editableFields.firstName
                                            ? "border-b-2 border-blue-500 pb-1"
                                            : "border-b border-transparent"
                                    }`}
                                    disabled={!editableFields.firstName || updateProfileMutation.isPending}
                                />
                                <button
                                    onClick={() =>
                                        setEditableFields((prev) => ({
                                            ...prev,
                                            firstName: !editableFields.firstName,
                                        }))
                                    }
                                    disabled={updateProfileMutation.isPending}
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Last Name */}
                        <div className="flex flex-col sm:flex-row sm:items-center md:gap-4 p-4 rounded-xl border border-zinc-200 transition-colors duration-200">
                            <label className="text-base md:text-lg font-semibold text-gray-700 min-w-[120px]">
                                Last Name
                            </label>
                            <div className="flex-1 flex items-center gap-3">
                                <input
                                    type="text"
                                    maxLength={30}
                                    value={user.lastName}
                                    onChange={handleEdit}
                                    name="lastName"
                                    className={`flex-1 bg-transparent text-lg outline-none transition-all duration-200 ${
                                        editableFields.lastName
                                            ? "border-b-2 border-blue-500 pb-1"
                                            : "border-b border-transparent"
                                    }`}
                                    disabled={!editableFields.lastName || updateProfileMutation.isPending}
                                />
                                <button
                                    onClick={() =>
                                        setEditableFields((prev) => ({
                                            ...prev,
                                            lastName: !editableFields.lastName,
                                        }))
                                    }
                                    disabled={updateProfileMutation.isPending}
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex flex-col sm:flex-row sm:items-center md:gap-4 p-4 rounded-xl border border-zinc-200 transition-colors duration-200">
                            <label className="text-base md:text-lg font-semibold text-gray-700 min-w-[120px]">
                                Email
                            </label>
                            <div className="flex-1 flex items-center gap-3">
                                <input
                                    type="email"
                                    value={user.email}
                                    onChange={handleEdit}
                                    readOnly
                                    name="email"
                                    className={`flex-1 bg-transparent text-lg outline-none transition-all duration-200 ${
                                        editableFields.email
                                            ? "border-b-2 border-blue-500 pb-1"
                                            : "border-b border-transparent"
                                    }`}
                                    disabled={!editableFields.email || updateProfileMutation.isPending}
                                />
                            </div>
                        </div>
                        {/* location */}
                        <div className="flex flex-col sm:flex-row sm:items-center md:gap-4 p-4 rounded-xl border border-zinc-200 transition-colors duration-200 w-full">
                            <label className="text-base md:text-lg font-semibold text-gray-700 min-w-[120px]">
                                Location
                            </label>
                            <div className="flex-1 flex items-center gap-3">
                                <input
                                    type="text"
                                    value={user.location || ""}
                                    onChange={handleEdit}
                                    name="location"
                                    className={`flex-1 bg-transparent text-lg outline-none transition-all duration-200 ${
                                        editableFields.location
                                            ? "border-b-2 border-blue-500 pb-1"
                                            : "border-b border-transparent"
                                    }`}
                                    disabled={!editableFields.location || updateProfileMutation.isPending}
                                />
                                <button
                                    onClick={() =>
                                        setEditableFields((prev) => ({
                                            ...prev,
                                            location: !editableFields.location,
                                        }))
                                    }
                                    disabled={updateProfileMutation.isPending}
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        {/* Social Links */}
                        <div className="flex flex-col sm:flex-row md:gap-4 p-4 rounded-xl border border-zinc-200 transition-colors duration-200">
                            <label className="text-base md:text-lg font-semibold text-gray-700 md:min-w-[120px] sm:mt-2">
                                Social Links
                            </label>

                            <div className="flex-1 flex flex-col gap-3">
                                {user.socials && user.socials.length > 0 ? (
                                    user.socials.map((social, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col md:flex-row items-center gap-3 border-b border-gray-200 pb-2"
                                        >
                                            <input
                                                type="text"
                                                name={`socials[${index}].field`}
                                                value={social.field}
                                                onChange={handleEdit}
                                                placeholder="Platform (e.g., LinkedIn)"
                                                className={`max-w-full bg-transparent text-lg outline-none transition-all duration-200 ${
                                                    editableFields.socials
                                                        ? "border-b-2 border-blue-500 pb-1"
                                                        : "border-b border-transparent"
                                                }`}
                                                disabled={!editableFields.socials || updateProfileMutation.isPending}
                                            />
                                            <input
                                                type="text"
                                                name={`socials[${index}].link`}
                                                value={social.link}
                                                onChange={handleEdit}
                                                placeholder="Profile link"
                                                className={`max-w-full flex-[2] bg-transparent text-lg outline-none transition-all duration-200 ${
                                                    editableFields.socials
                                                        ? "border-b-2 border-blue-500 pb-1"
                                                        : "border-b border-transparent"
                                                }`}
                                                disabled={!editableFields.socials || updateProfileMutation.isPending}
                                            />
                                            <button
                                                onClick={() => handleRemoveSocial(index)}
                                                disabled={!editableFields.socials || updateProfileMutation.isPending}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors duration-200"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No social links added yet.</p>
                                )}

                                {editableFields.socials && (
                                    <button
                                        onClick={handleAddSocial}
                                        disabled={updateProfileMutation.isPending}
                                        className="self-start mt-2 px-3 py-2 bg-blue-50 text-gray-700 font-medium rounded-lg hover:bg-blue-100 transition-all duration-200"
                                    >
                                        + Add Social Link
                                    </button>
                                )}

                                <button
                                    onClick={() =>
                                        setEditableFields((prev) => ({
                                            ...prev,
                                            socials: !editableFields.socials,
                                        }))
                                    }
                                    disabled={updateProfileMutation.isPending}
                                    className="mt-2 p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200 self-start"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* About */}
                        <div className="flex flex-col sm:flex-row md:gap-4 p-4 rounded-xl border border-zinc-200 transition-colors duration-200">
                            <label className="text-base md:text-lg font-semibold text-gray-700 md:min-w-[120px] sm:mt-2">
                                About
                            </label>
                            <div className="flex-1 flex flex-col gap-3">
                                <textarea
                                    value={user.about || ""}
                                    maxLength={300}
                                    onChange={handleEdit}
                                    name="about"
                                    placeholder="Write something about yourself..."
                                    rows={user.about.length > 0 ? 7 : 1}
                                    className={`w-full bg-transparent text-lg outline-none resize-none transition-all duration-200 ${
                                        editableFields.about
                                            ? "border-b-2 border-blue-500 pb-1"
                                            : "border-b border-transparent"
                                    }`}
                                    disabled={!editableFields.about || updateProfileMutation.isPending}
                                />
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() =>
                                            setEditableFields((prev) => ({
                                                ...prev,
                                                about: !editableFields.about,
                                            }))
                                        }
                                        disabled={updateProfileMutation.isPending}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200 self-start"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <span className="text-sm text-gray-500">{user.about?.length || 0}/300</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Pinnedprojects user={user} handleChange={handleChangePins} />
        </div>
    );
}
