import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import { endpoints } from "../constant/constant";
import axios from "axios";
import { useLoader } from "../contexts/GlobalLoaderContext";

interface User {
    _id: string;
    email: string;
}

interface AddProjectProps {
    onClose: () => void;
}

const AddProject: React.FC<AddProjectProps> = ({ onClose }) => {
    const [projectName, setProjectName] = useState("");
    const [expectedDays, setExpectedDays] = useState<number | "">("");
    const [projectDescription, setProjectDescription] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const { showLoader, hideLoader }: any = useLoader();

    // =========================
    // File States
    // =========================
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const colors = ["#3b5998", "#00acee", "#ff69b4", "#ffa500", "#4caf50"];

    // =========================
    // Debounced search for users
    // =========================
    useEffect(() => {
        const controller = new AbortController();
        const handler = setTimeout(() => {
            if (!searchTerm.trim()) {
                setFilteredUsers([]);
                return;
            }

            const fetchUsers = async () => {
                try {
                    setLoadingUsers(true);
                    const res = await fetch(`${endpoints.searchUser}?search=${encodeURIComponent(searchTerm)}`, {
                        signal: controller.signal,
                    });

                    if (!res.ok) throw new Error("Failed to fetch users");

                    const data: User[] = await res.json();
                    console.log(data);

                    // Defensive filter: keep only objects with valid _id and name
                    const filtered = data.filter(
                        (u) => u && u._id && typeof u.email === "string" && !selectedUsers.find((s) => s._id === u._id)
                    );

                    const searchLower = searchTerm.toLowerCase();

                    // Defensive sort
                    const sorted = filtered.sort((a, b) => {
                        const nameA = a.email?.toLowerCase() || "";
                        const nameB = b.email?.toLowerCase() || "";
                        const aStarts = nameA.startsWith(searchLower);
                        const bStarts = nameB.startsWith(searchLower);

                        if (aStarts && !bStarts) return -1;
                        if (!aStarts && bStarts) return 1;

                        return nameA.localeCompare(nameB);
                    });

                    setFilteredUsers(sorted);
                } catch (err: any) {
                    if (err.name !== "AbortError") console.error(err);
                } finally {
                    setLoadingUsers(false);
                }
            };

            fetchUsers();
        }, 500);

        return () => {
            controller.abort();
            clearTimeout(handler);
        };
    }, [searchTerm, selectedUsers]);

    // =========================
    // Add & Remove Users
    // =========================
    const addUser = (user: User) => {
        setSelectedUsers([...selectedUsers, user]);
        setSearchTerm("");
        setFilteredUsers([]);
    };

    const removeUser = (id: string) => {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== id));
    };

    // =========================
    // File Handling
    // =========================
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(files);

        // generate previews only for images
        const imagePreviews = files.map((file) => (file.type.startsWith("image/") ? URL.createObjectURL(file) : ""));
        setPreviews(imagePreviews);
    };

    const removeFile = (index: number) => {
        // Revoke object URL if it's an image to prevent memory leaks
        if (previews[index]) {
            URL.revokeObjectURL(previews[index]);
        }

        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // =========================
    // Handle Submit
    // =========================
    const handleSubmit = async () => {
        if (!projectName) return alert("Project name required");
        if (!expectedDays) return alert("Expected days required");
        if (selectedUsers.length === 0) return alert("Select at least one user");

        setUploading(true);

        try {
            let uploadedDocuments: {
                fileName: string;
                originalName: string;
                fileUrl: string;
            }[] = [];

            // 1. Upload files first (if any)
            if (selectedFiles.length > 0) {
                const formData = new FormData();
                selectedFiles.forEach((file) => formData.append("files", file));

                const fileRes = await axios.post(endpoints.upload, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                uploadedDocuments = fileRes.data.files.map(
                    (file: { url: string; public_id: string }, index: number) => ({
                        fileName: file.public_id, // Cloudinary public ID
                        originalName: selectedFiles[index]?.name || file.public_id,
                        fileUrl: file.url,
                    })
                );
            }

            // 2. Create the project including uploaded documents
            const newProject = {
                name: projectName,
                expectedDays: Number(expectedDays),
                assignedUsers: selectedUsers.map((u) => u._id),
                description: projectDescription,
                documents: uploadedDocuments,
            };

            showLoader();
            const res = await fetch(endpoints.createProject, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify(newProject),
            });

            if (!res.ok) throw new Error("Failed to create project");

            const data = await res.json();
            console.log("✅ Project created:", data);
            alert("✅ Project with file(s) uploaded successfully!");

            // Reset form
            setProjectName("");
            setExpectedDays("");
            setProjectDescription("");
            setSelectedUsers([]);
            setSelectedFiles([]);
            setPreviews([]);
            onClose();
        } catch (error) {
            console.error(error);
            alert("❌ Failed to submit project with file(s)");
        } finally {
            setUploading(false);
            hideLoader();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-40 p-4">
            <div className="bg-white w-full max-w-4xl border border-black shadow-xl mt-5 relative p-6 animate-slideIn max-h-[100vh] overflow-y-auto">
                {/* Close button */}
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-poppins mb-6">Add Project</h2>

                {/* Project Fields */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left side */}
                    <div className="w-full md:w-1/2">
                        <div className="mb-4">
                            <label className="block text-black">Project name</label>
                            <input
                                type="text"
                                placeholder="Project name"
                                className="w-full mt-1 border border-gray-300 px-3 py-2 bg-gray-200"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <input
                                type="number"
                                placeholder="Expected time in days"
                                className="w-full mt-1 border border-gray-300 px-3 py-2 bg-gray-200"
                                value={expectedDays}
                                min={0}
                                onChange={(e) => setExpectedDays(e.target.value ? Number(e.target.value) : "")}
                            />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="w-full md:w-1/2">
                        <label className="block text-black">Project description</label>
                        <textarea
                            placeholder="Enter project description..."
                            className="w-full h-32 md:h-[90%] mt-1 border border-gray-300 px-3 py-2 bg-gray-200 resize-none"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                        />
                    </div>
                </div>

                {/* Document Upload */}
                <div className="w-full text-xs py-6 md:py-8 lg:py-10 flex flex-col gap-4">
                    <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,image/*"
                        multiple
                    />

                    <div className="flex justify-between items-center">
                        <button
                            className="flex items-center w-auto cursor-pointer"
                            onClick={() => document.getElementById("fileInput")?.click()}
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
                            </div>
                        </button>
                    </div>

                    {/* File Previews */}
                    {selectedFiles.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-2 font-medium text-sm">Selected Files ({selectedFiles.length}):</p>
                            <div className="flex flex-wrap gap-3">
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
                                                    onClick={() => removeFile(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                    onClick={() => removeFile(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg cursor-pointer"
                                    style={{ backgroundColor: colors[idx % colors.length] }}
                                    title="Click to remove"
                                    onClick={() => removeUser(user._id)}
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
                                className="w-full p-3 bg-gray-200 border border-gray-300 rounded-t-lg text-gray-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <div className="absolute w-full bg-white border border-gray-300 rounded-b-lg max-h-60 overflow-y-auto z-50">
                                    {loadingUsers ? (
                                        <div className="text-gray-500 text-sm p-2">Loading...</div>
                                    ) : filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <div
                                                key={user._id}
                                                className="py-1 px-2 cursor-pointer hover:bg-blue-200 bg-blue-100 text-gray-800"
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

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={uploading}
                    className={`bg-black text-white px-10 py-3 rounded-md w-full ${
                        uploading && "opacity-50 cursor-not-allowed"
                    }`}
                >
                    {uploading ? "Uploading..." : "Start"}
                </button>
            </div>
        </div>
    );
};

export default AddProject;
