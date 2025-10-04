import { useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { current_url } from "../../constant/constant";
import { jwtDecode } from "jwt-decode";
import avatar from "../../assets/avatar.jpg";
import { CircularProgress } from "@mui/material";
import { Edit } from "@mui/icons-material";

interface UserType {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    about?: string;
}

interface UploadResponse {
    files: Array<{ url: string }>;
}

interface JwtPayload {
    id: string;
}

// Fetch user profile function
const fetchUserProfile = async (id: string): Promise<UserType> => {
    const res = await fetch(`${current_url}/users/${id}`, {
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
    });
    const [localUser, setLocalUser] = useState<UserType | null>(null);
    const queryClient = useQueryClient();

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
    } = useQuery<UserType, Error>({
        queryKey: ["user", id],
        queryFn: () => fetchUserProfile(id),
        enabled: !!id,
    });

    // Set local user when data loads
    useEffect(() => {
        if (user && !localUser) {
            setLocalUser(user);
        }
    }, [user, localUser]);

    // Mutation for updating user profile
    const updateProfileMutation = useMutation<UserType, Error, { id: string; userData: Partial<UserType> }>({
        mutationFn: updateUserProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(["user", id], data);
            setLocalUser(data);
            setEditableFields({
                firstName: false,
                lastName: false,
                email: false,
                about: false,
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
        setLocalUser((prev) => (prev ? { ...prev, [name]: value } : null));
    };

    const handleSubmit = () => {
        if (localUser) {
            updateProfileMutation.mutate({ id, userData: localUser });
        }
    };

    const handleReset = () => {
        setLocalUser(user || null);
        setEditableFields({
            firstName: false,
            lastName: false,
            email: false,
            about: false,
        });
    };

    const hasChanges = localUser && user && JSON.stringify(localUser) !== JSON.stringify(user);

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

    // Use localUser if available, otherwise use the original user data
    const displayUser = localUser || user;

    return (
        <div className="w-full min-h-screen flex justify-center items-center p-4 md:p-6 lg:p-10">
            <div className="usercard w-full max-w-2xl bg-background rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 flex flex-col items-center gap-6 md:gap-8 lg:gap-10 shadow-lg border border-gray-200">
                {/* Profile Section */}
                <div className="profile w-full flex flex-col items-center">
                    <div className="pfp w-32 h-32 md:w-40 md:h-40 lg:w-50 lg:h-50 rounded-full border-4 border-gray-200 relative group overflow-hidden transition-all duration-300">
                        <img
                            src={displayUser.profilePicture || preview || avatar}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                        />
                        <div className="w-full h-full absolute top-0 left-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                            <button
                                className="text-white text-sm md:text-base font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center px-2"
                                onClick={() => inputRef.current?.click()}
                            >
                                Change profile picture
                            </button>
                        </div>

                        <input
                            type="file"
                            className="hidden"
                            ref={inputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                        />

                        {(uploadPfpMutation.isPending || updateProfileMutation.isPending) && (
                            <div className="z-10 w-full h-full absolute top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                <CircularProgress size={32} style={{ color: "white" }} />
                            </div>
                        )}
                    </div>

                    <p className="text-text font-family my-3 text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                        {displayUser.firstName}&nbsp;{displayUser.lastName}
                    </p>
                </div>

                {/* Edit Profile Form */}
                <div className="editprofile flex flex-col gap-4 md:gap-5 w-full max-w-lg">
                    {/* First Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                        <label className="text-text w-full sm:w-32 text-base md:text-xl font-medium">First Name</label>
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="text"
                                maxLength={30}
                                value={displayUser.firstName}
                                name="firstName"
                                onChange={handleEdit}
                                className={`text-text text-base md:text-xl w-full min-h-12 px-3 border-2 rounded-lg transition-all ${
                                    editableFields.firstName ? "border-blue-500 bg-white" : "border-gray-200 bg-gray-50"
                                }`}
                                disabled={!editableFields.firstName}
                            />
                            <button
                                onClick={() =>
                                    setEditableFields((prev) => ({
                                        ...prev,
                                        firstName: !prev.firstName,
                                    }))
                                }
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Edit className="text-text cursor-pointer" />
                            </button>
                        </div>
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                        <label className="text-text w-full sm:w-32 text-base md:text-xl font-medium">Last Name</label>
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="text"
                                maxLength={30}
                                value={displayUser.lastName}
                                onChange={handleEdit}
                                name="lastName"
                                className={`text-text text-base md:text-xl w-full min-h-12 px-3 border-2 rounded-lg transition-all ${
                                    editableFields.lastName ? "border-blue-500 bg-white" : "border-gray-200 bg-gray-50"
                                }`}
                                disabled={!editableFields.lastName}
                            />
                            <button
                                onClick={() =>
                                    setEditableFields((prev) => ({
                                        ...prev,
                                        lastName: !prev.lastName,
                                    }))
                                }
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Edit className="text-text cursor-pointer" />
                            </button>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                        <label className="text-text w-full sm:w-32 text-base md:text-xl font-medium">
                            Email address
                        </label>
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="email"
                                value={displayUser.email}
                                onChange={handleEdit}
                                name="email"
                                className={`text-text text-base md:text-xl w-full min-h-12 px-3 border-2 rounded-lg transition-all ${
                                    editableFields.email ? "border-blue-500 bg-white" : "border-gray-200 bg-gray-50"
                                }`}
                                disabled={!editableFields.email}
                            />
                            <button
                                onClick={() =>
                                    setEditableFields((prev) => ({
                                        ...prev,
                                        email: !prev.email,
                                    }))
                                }
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Edit className="text-text cursor-pointer" />
                            </button>
                        </div>
                    </div>

                    {/* About */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 w-full">
                        <label className="text-text w-full sm:w-32 text-base md:text-xl font-medium mt-2">About</label>
                        <div className="flex items-start gap-2 flex-1">
                            <textarea
                                value={displayUser.about || ""}
                                maxLength={300}
                                onChange={handleEdit}
                                name="about"
                                placeholder="Write something about you..."
                                className={`text-text text-base md:text-xl w-full min-h-32 px-3 py-2 border-2 rounded-lg resize-none transition-all ${
                                    editableFields.about ? "border-blue-500 bg-white" : "border-gray-200 bg-gray-50"
                                }`}
                                disabled={!editableFields.about}
                            />
                            <button
                                onClick={() =>
                                    setEditableFields((prev) => ({
                                        ...prev,
                                        about: !prev.about,
                                    }))
                                }
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors mt-2"
                            >
                                <Edit className="text-text cursor-pointer" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {hasChanges && (
                    <div className="btns flex gap-3 md:gap-5 w-full max-w-lg justify-center">
                        <button
                            className="border-2 border-gray-600 px-4 md:px-6 py-2 md:py-3 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base"
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                        <button
                            className="bg-black px-4 md:px-6 py-2 md:py-3 rounded-lg text-white font-semibold hover:bg-gray-800 transition-colors text-sm md:text-base"
                            onClick={handleSubmit}
                            disabled={updateProfileMutation.isPending}
                        >
                            {updateProfileMutation.isPending ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
