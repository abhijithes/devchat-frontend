import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import { endpoints } from "../constant/constant";
import axios from "axios";
import { useLoader } from "../contexts/GlobalLoaderContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../utils/token";
import { useSnackBar } from "../components/snack-bar/snack-bar-context";
import api from "../utils/axios";

interface User {
    _id: string;
    email: string;
}

interface UploadedDocument {
    fileName: string;
    originalName: string;
    fileUrl: string;
}

interface ProjectData {
    name: string;
    expectedDays: number;
    assignedUsers: string[];
    description: string;
    documents: UploadedDocument[];
}

interface AddProjectProps {
    onClose: () => void;
    initialData?: {
        projectId: string;
        name: string;
        expectedDays: number | "";
        description: string;
    };
}

const AddProject: React.FC<AddProjectProps> = ({ onClose, initialData }) => {
    const [projectName, setProjectName] = useState(initialData?.name || "");
    const [expectedDays, setExpectedDays] = useState<number | "">(initialData?.expectedDays || 0);
    const [projectDescription, setProjectDescription] = useState(initialData?.description || "");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const { showLoader, hideLoader }: any = useLoader();
    const queryClient = useQueryClient();
    const { showSnackBar } = useSnackBar();
    const { id } = JSON.parse(localStorage.getItem("DEV_CHATX_USER_URD"));

    const colors = ["#3b5998", "#00acee", "#ff69b4", "#ffa500", "#4caf50"];

    // Search users query with debouncing
    const {
        data: filteredUsers = [],
        isLoading: loadingUsers,
        isError: searchError,
    } = useQuery({
        queryKey: ["users", searchTerm, selectedUsers],
        queryFn: async () => {
            if (!searchTerm.trim()) return [];

            const response = await fetch(`${endpoints.searchUser}/${id}?search=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) throw new Error("Failed to fetch users");

            const data: User[] = await response.json();

            // Filter out already selected users and invalid data
            return data
                .filter((u) => u && u._id && typeof u.email === "string" && !selectedUsers.find((s) => s._id === u._id))
                .sort((a, b) => {
                    const searchLower = searchTerm.toLowerCase();
                    const nameA = a.email?.toLowerCase() || "";
                    const nameB = b.email?.toLowerCase() || "";
                    const aStarts = nameA.startsWith(searchLower);
                    const bStarts = nameB.startsWith(searchLower);

                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;

                    return nameA.localeCompare(nameB);
                });
        },
        enabled: searchTerm.trim().length > 0,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    // File upload mutation
    const fileUploadMutation = useMutation({
        mutationFn: async (files: File[]) => {
            const formData = new FormData();
            files.forEach((file) => formData.append("files", file));

            const response = await axios.post(endpoints.upload, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            return response.data.files.map((file: { url: string; public_id: string }, index: number) => ({
                fileName: file.public_id,
                originalName: files[index]?.name || file.public_id,
                fileUrl: file.url,
            })) as UploadedDocument[];
        },
        onError: (error) => {
            console.error("File upload error:", error);
            showSnackBar("File upload failed", "error", 3000);
        },
    });

    // Project creation mutation
    const createProjectMutation = useMutation({
        mutationFn: async (projectData: ProjectData) => {
            showLoader();
            const response = await fetch(endpoints.createProject, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify(projectData),
            });

            if (!response.ok) throw new Error("Failed to create project");
            return await response.json();
        },
        onSuccess: (data) => {
            console.log(" Project created:", data);
            showSnackBar("Project created successfully", "success", 3000);

            // Invalidate projects query to refresh the list
            queryClient.invalidateQueries({ queryKey: ["projects"] });

            // Reset form and close
            resetForm();
            onClose();
        },
        onError: (error: Error) => {
            console.error("Project creation error:", error);
            showSnackBar("Project creation failed", "error", 3000);
        },
        onSettled: () => {
            hideLoader();
        },
    });

    const updateProject = useMutation({
        mutationFn: async (projectData: { projectName; expectedDays; projectDescription }) => {
            showLoader();
            console.log("projectID to update:", initialData.projectId);

            const response = await api.put(`${endpoints.updateProject(initialData.projectId)}`, {
                name: projectData.projectName,
                expectedDays: projectData.expectedDays,
                description: projectData.projectDescription,
            });
            if (response.status < 200 || response.status >= 300) throw new Error("Failed to update project");
            return response.data;
        },
        onSuccess: () => {
            showSnackBar("Project updated successfully", "success", 3000);
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project", initialData.projectId] });
            resetForm();
            onClose();
        },
        onError: (error: Error) => {
            console.error("Project update error:", error);
            showSnackBar("Project update failed", "error", 3000);
        },
        onSettled: () => {
            hideLoader();
        },
    });

    const uploading = fileUploadMutation.isPending || createProjectMutation.isPending;

    // Combined upload and create project handler
    const handleSubmit = async () => {
        if (!projectName) return alert("Project name required");
        if (!expectedDays) return alert("Expected days required");
        if (selectedUsers.length === 0) return alert("Select at least one user");

        try {
            let uploadedDocuments: UploadedDocument[] = [];

            // Upload files first if any
            if (selectedFiles.length > 0) {
                uploadedDocuments = await fileUploadMutation.mutateAsync(selectedFiles);
            }

            // Create project with uploaded documents
            const newProject: ProjectData = {
                name: projectName,
                expectedDays: Number(expectedDays),
                assignedUsers: selectedUsers.map((u) => u._id),
                description: projectDescription,
                documents: uploadedDocuments,
            };

            await createProjectMutation.mutateAsync(newProject);
        } catch (error) {
            console.error("Submit error:", error);
            // Error handling is done in mutation onError callbacks
        }
    };

    // Reset form function
    const resetForm = () => {
        setProjectName("");
        setExpectedDays("");
        setProjectDescription("");
        setSelectedUsers([]);
        setSelectedFiles([]);
        setPreviews([]);
        setSearchTerm("");

        // Revoke all object URLs to prevent memory leaks
        previews.forEach((url) => url && URL.revokeObjectURL(url));
    };

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            previews.forEach((url) => url && URL.revokeObjectURL(url));
        };
    }, [previews]);

    // =========================
    // Add & Remove Users
    // =========================
    const addUser = (user: User) => {
        setSelectedUsers([...selectedUsers, user]);
        setSearchTerm("");
    };

    const removeUser = (id: string) => {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== id));
    };

    // =========================
    // File Handling
    // =========================
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);

        // Check if adding new files would exceed reasonable limit
        const totalFiles = selectedFiles.length + files.length;
        if (totalFiles > 10) {
            alert(`Maximum of 10 files allowed. You currently have ${selectedFiles.length} files selected.`);
            return;
        }

        setSelectedFiles((prev) => [...prev, ...files]);

        // Generate previews only for images
        const newPreviews = files.map((file) => (file.type.startsWith("image/") ? URL.createObjectURL(file) : ""));
        setPreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeFile = (index: number) => {
        // Revoke object URL if it's an image to prevent memory leeaks
        if (previews[index]) {
            URL.revokeObjectURL(previews[index]);
        }

        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4 mt-20 md:mt-0 overflow-auto">
            <div className="bg-white w-full max-w-4xl  rounded-xl shadow-xl mt-5 relative p-6 animate-slideIn max-h-[95vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black"
                    disabled={uploading}
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-poppins mb-6">{initialData ? "Update Project" : "Add Project"}</h2>

                {/* Error Messages */}
                {(fileUploadMutation.isError || createProjectMutation.isError) && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                        {fileUploadMutation.error?.message || createProjectMutation.error?.message}
                    </div>
                )}

                {/* Project Fields */}
                <div className="flex flex-col md:flex-row md:gap-6">
                    {/* Left side */}
                    <div className="w-full md:w-1/2">
                        <div className="mb-4">
                            <label className="block text-black">Project name</label>
                            <input
                                type="text"
                                placeholder="Project name"
                                className="w-full mt-1 border border-gray-300 px-3 py-2 bg-gray-200 outline-zinc-300"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                disabled={uploading}
                            />
                        </div>
                        <div className="mb-6">
                            <input
                                type="number"
                                placeholder="Expected time in days"
                                className="w-full mt-1 border border-gray-300 px-3 py-2 bg-gray-200 outline-zinc-300"
                                value={expectedDays}
                                min={0}
                                onChange={(e) => setExpectedDays(e.target.value ? Number(e.target.value) : "")}
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="w-full md:w-1/2">
                        <label className="block text-black">Project description</label>
                        <textarea
                            placeholder="Enter project description..."
                            className="w-full h-32 md:h-[90%] mt-1 border border-gray-300 px-3 py-2 bg-gray-200 outline-zinc-300 resize-none"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            disabled={uploading}
                        />
                    </div>
                </div>

                {/* Document Upload */}
                {initialData ? null : (
                    <>
                        <div className="w-full text-xs py-6 md:py-8 lg:py-10 flex flex-col gap-4">
                            <input
                                type="file"
                                id="fileInput"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt,image/*"
                                multiple
                                disabled={uploading || selectedFiles.length >= 10}
                            />

                            <div className="flex justify-between items-center">
                                <button
                                    className={`flex items-center w-auto ${
                                        uploading || selectedFiles.length >= 10
                                            ? "cursor-not-allowed opacity-50"
                                            : "cursor-pointer"
                                    }`}
                                    onClick={() =>
                                        !uploading &&
                                        selectedFiles.length < 10 &&
                                        document.getElementById("fileInput")?.click()
                                    }
                                    disabled={uploading || selectedFiles.length >= 10}
                                >
                                    <div className="icon centered w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
                                        <TextSnippetOutlinedIcon fontSize="large" />
                                    </div>
                                    <div className="flex flex-col items-start justify-center ml-2">
                                        <span>Upload</span>
                                        <span className="font-semibold">
                                            {selectedFiles.length > 0
                                                ? `${selectedFiles.length} file${
                                                      selectedFiles.length !== 1 ? "s" : ""
                                                  } selected`
                                                : "Documents or Images"}
                                        </span>
                                        {selectedFiles.length >= 10 && (
                                            <span className="text-red-500 text-xs">Maximum 10 files reached</span>
                                        )}
                                    </div>
                                </button>
                            </div>

                            {/* File Previews */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 font-medium text-sm">Selected Files ({selectedFiles.length}):</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="relative group">
                                                {previews[index] ? (
                                                    <div className="w-24 h-24 relative">
                                                        <img
                                                            src={previews[index]}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-full object-cover rounded-lg border"
                                                        />
                                                        <button
                                                            onClick={() => !uploading && removeFile(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            disabled={uploading}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center truncate">
                                                            {file.name.length > 15
                                                                ? file.name.substring(0, 15) + "..."
                                                                : file.name}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-24 h-24 bg-gray-100 border rounded-lg flex flex-col items-center justify-center p-2 relative group">
                                                        <TextSnippetOutlinedIcon className="text-gray-400" />
                                                        <span className="text-xs text-gray-600 text-center mt-1 truncate w-full">
                                                            {file.name.length > 15
                                                                ? file.name.substring(0, 15) + "..."
                                                                : file.name}
                                                        </span>
                                                        <button
                                                            onClick={() => !uploading && removeFile(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            disabled={uploading}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* People Section */}
                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Peoples</label>
                            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
                                {/* Selected users */}
                                <div className="flex flex-wrap gap-3">
                                    {selectedUsers.map((user, idx) => (
                                        <div
                                            key={user._id}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg ${
                                                uploading ? "cursor-not-allowed" : "cursor-pointer"
                                            }`}
                                            style={{ backgroundColor: colors[idx % colors.length] }}
                                            title={uploading ? "Upload in progress" : "Click to remove"}
                                            onClick={() => !uploading && removeUser(user._id)}
                                        >
                                            {user.email[0].toUpperCase()}
                                        </div>
                                    ))}
                                </div>

                                {/* Search box + results */}
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Search person / group"
                                        className="w-full p-3 bg-gray-200 outline-zinc-300 border border-gray-300 rounded-t-lg text-gray-700"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        disabled={uploading}
                                    />
                                    {searchTerm && (
                                        <div className="absolute w-full bg-white border border-gray-300 rounded-b-lg max-h-60 overflow-y-auto z-50 shadow-lg">
                                            {loadingUsers ? (
                                                <div className="text-gray-500 text-sm p-2">Loading...</div>
                                            ) : searchError ? (
                                                <div className="text-red-500 text-sm p-2">Error loading users</div>
                                            ) : filteredUsers.length > 0 ? (
                                                filteredUsers.map((user) => (
                                                    <div
                                                        key={user._id}
                                                        className="py-2 px-3 cursor-pointer hover:bg-blue-100 text-gray-800 border-b border-gray-100 last:border-b-0"
                                                        onClick={() => addUser(user)}
                                                    >
                                                        {user.email}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-500 text-sm p-2">No users found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Submit Button */}
                <button
                    onClick={() => {
                        if (initialData) {
                            updateProject.mutate({ projectName, expectedDays, projectDescription });
                        } else {
                            handleSubmit();
                        }
                    }}
                    disabled={uploading}
                    className={`bg-black text-white px-10 py-3 rounded-md w-full transition-all md:mt-10 ${
                        uploading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
                    }`}
                >
                    {initialData
                        ? uploading
                            ? "Updating Project..."
                            : "Update Project"
                        : uploading
                        ? "Creating Project..."
                        : "Start"}
                </button>
            </div>
        </div>
    );
};

export default AddProject;
