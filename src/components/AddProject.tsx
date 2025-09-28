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

    const { showLoader, hideLoader }: any = useLoader()

    // file states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
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
                    const res = await fetch(
                        `${endpoints.searchUser}?search=${encodeURIComponent(searchTerm)}`,
                        { signal: controller.signal }
                    );

                    if (!res.ok) throw new Error("Failed to fetch users");

                    const data: User[] = await res.json();
                    console.log(data)

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
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);

        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
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
            let uploadedDocument = null;

            // 1. Upload the file first (if any)
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);

                const fileRes = await axios.post(endpoints.upload, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });

                uploadedDocument = {
                    fileName: fileRes.data.public_id, // Cloudinary public ID
                    originalName: selectedFile.name,
                    fileUrl: fileRes.data.url,
                };
            }

            // 2. Create the project including uploaded document
            const newProject = {
                name: projectName,
                expectedDays: Number(expectedDays),
                assignedUsers: selectedUsers.map((u) => u._id),
                description: projectDescription,
                documents: uploadedDocument ? [uploadedDocument] : [],
            };

            showLoader()
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
            alert("✅ Project with file uploaded successfully!");

            // Reset form
            setProjectName("");
            setExpectedDays("");
            setProjectDescription("");
            setSelectedUsers([]);
            setSelectedFile(null);
            setPreview(null);
            onClose();
        } catch (error) {
            console.error(error);
            alert("❌ Failed to submit project with file");
        } finally {
            setUploading(false);
            hideLoader()
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-40 p-4">
            <div className="bg-white w-full max-w-4xl border border-black shadow-xl mt-5 relative p-6 animate-slideIn max-h-[100vh]">
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
                                    {selectedFile ? selectedFile.name : "Document or Image"}
                                </span>
                            </div>
                        </button>
                    </div>

                    {preview && (
                        <div className="mt-4">
                            <p className="mb-2 font-medium text-sm">Image Preview:</p>
                            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
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
                    className={`bg-black text-white px-10 py-3 rounded-md w-full ${uploading && "opacity-50 cursor-not-allowed"
                        }`}
                >
                    {uploading ? "Uploading..." : "Start"}
                </button>
            </div>
        </div>
    );
};

export default AddProject;
