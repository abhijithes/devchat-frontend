import React, { useState } from "react";
import { endpoints } from "../../constant/constant";
import { X } from "lucide-react";

interface UploadButtonProps {
    onUploadComplete: (file: UploadedFile) => void; // callback to parent
}

interface UploadedFile {
    url: string;
    public_id: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUploadComplete }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Handle file select
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);

            // Show image preview if it's an image
            if (file.type.startsWith("image/")) {
                const preview = URL.createObjectURL(file);
                setPreviewUrl(preview);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    // Upload file to backend
    const handleUpload = async () => {
        if (!selectedFile) return alert("Please select a file first.");

        const formData = new FormData();
        formData.append("file", selectedFile);

        setLoading(true);
        try {
            const response = await fetch(endpoints.upload, {
                method: "POST",
                body: formData,
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });

            const data: UploadedFile & { message: string } = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            // Pass uploaded file data to parent
            onUploadComplete({ url: data.url, public_id: data.public_id });

            // Reset UI
            setSelectedFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error("Upload error:", error);
            alert("File upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4 justify-center">
            {/* File input */}
            {/* Preview (for images only) */}
            {previewUrl && (
                <div className="w-24 h-24 relative">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover border rounded relative"
                    ></img>
                    <X
                        className="absolute top-1 right-1 opacity-75"
                        onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                        }}
                    />
                </div>
            )}

            {/* Show filename if non-image */}
            {!previewUrl && selectedFile && <div className="text-sm text-gray-600">{selectedFile.name}</div>}
            <div className="flex gap-2">
                <input type="file" onChange={handleFileChange} className="hidden" id="file-input" />
                <label
                    htmlFor="file-input"
                    className="px-4 py-2 bg-gray-200 border rounded cursor-pointer hover:bg-gray-300"
                >
                    Choose File
                </label>

                {/* Upload button */}
                <button
                    onClick={handleUpload}
                    disabled={loading || !selectedFile}
                    className={` px-4 py-2 rounded text-white ${loading || !selectedFile ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                        }`}
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>
    );
};

export default UploadButton;
