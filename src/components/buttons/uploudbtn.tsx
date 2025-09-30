import React, { useState, useRef } from "react";
import { endpoints } from "../../constant/constant";
import { X, FileUp, Upload } from "lucide-react";

interface UploadButtonProps {
    onUploadComplete: (file: UploadedFile) => void;
}

interface UploadedFile {
    url: string;
    public_id: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({ onUploadComplete }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file select
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        processSelectedFiles(files);
    };

    // Process selected files (used by both input and drag/drop)
    const processSelectedFiles = (files: File[]) => {
        if (files.length > 0) {
            // Check if adding new files would exceed 10 file limit
            const totalFiles = selectedFiles.length + files.length;
            if (totalFiles > 10) {
                alert(
                    `You can only upload up to 10 files. You currently have ${selectedFiles.length} files selected and tried to add ${files.length} more.`
                );
                return;
            }

            setSelectedFiles((prev) => [...prev, ...files]);

            // Generate previews for image files
            const newPreviews = files.map((file) =>
                file.type.startsWith("image/") ? URL.createObjectURL(file) : null
            );
            setPreviewUrls((prev) => [...prev, ...newPreviews]);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (selectedFiles.length >= 10) {
            alert("Maximum of 10 files reached. Remove some files to add more.");
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        processSelectedFiles(files);
    };

    // Upload file to backend
    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            return alert("Please select at least one file first.");
        }

        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append("files", file);
        });

        setLoading(true);
        try {
            const response = await fetch(endpoints.upload, {
                method: "POST",
                body: formData,
                headers: {
                    authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Upload failed");
            }

            // If backend returns multiple files
            if (Array.isArray(data.files)) {
                data.files.forEach((file: UploadedFile) => {
                    onUploadComplete({ url: file.url, public_id: file.public_id });
                });
            } else {
                // Fallback if only one file
                onUploadComplete({ url: data.url, public_id: data.public_id });
            }

            // Reset UI and close popup
            setSelectedFiles([]);
            setPreviewUrls([]);
            setShowPopup(false);
        } catch (error) {
            console.error("Upload error:", error);
            alert("File upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClosePopup = () => {
        setSelectedFiles([]);
        setPreviewUrls([]);
        setShowPopup(false);
        setIsDragOver(false);
    };

    const removeFile = (index: number) => {
        // Revoke object URL if it's an image to prevent memory leaks
        if (previewUrls[index]) {
            URL.revokeObjectURL(previewUrls[index]!);
        }

        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleLabelClick = (e: React.MouseEvent) => {
        if (selectedFiles.length >= 10) {
            e.preventDefault();
            return;
        }
        fileInputRef.current?.click();
    };

    return (
        <>
            {/* Upload Icon Button */}
            <button
                onClick={() => setShowPopup(true)}
                className="p-2 text-white rounded-sm hover:bg-gray-200 transition-colors centered cursor-pointer"
                title="Upload files"
            >
                <FileUp size={36} color="black" />
                <div className="flex flex-col ml-2 items-start justify-start">
                    <span className="text-text font-semibold text-sm">Uploud</span>
                    <span className="text-text text-sm">Document</span>
                </div>
            </button>

            {/* Popup Modal with Black Background */}
            {showPopup && (
                <div className="fixed inset-0 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-sm shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto border-1 ">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4">
                            <h2 className="text-lg font-semibold">Upload Files</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{selectedFiles.length}/10 files</span>
                                <button
                                    onClick={handleClosePopup}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            {/* File count warning */}
                            {selectedFiles.length >= 8 && (
                                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                                    {selectedFiles.length === 10
                                        ? "Maximum of 10 files reached. Remove some files to add more."
                                        : `You have ${selectedFiles.length} files. Maximum is 10.`}
                                </div>
                            )}

                            {/* Previews */}
                            {previewUrls.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium mb-2">Selected Files:</h3>
                                    <div className="flex gap-3 flex-wrap">
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="w-20 h-20 relative group">
                                                {url ? (
                                                    <>
                                                        <img
                                                            src={url}
                                                            alt={`Preview ${idx + 1}`}
                                                            className="w-full h-full object-cover border rounded"
                                                        />
                                                        <X
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                            size={16}
                                                            onClick={() => removeFile(idx)}
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                                                            {idx + 1}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full border rounded bg-gray-100 text-xs text-gray-600 p-1 relative group">
                                                        <div className="text-center break-words w-full">
                                                            {selectedFiles[idx].name.length > 15
                                                                ? selectedFiles[idx].name.substring(0, 15) + "..."
                                                                : selectedFiles[idx].name}
                                                        </div>
                                                        <X
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                            size={16}
                                                            onClick={() => removeFile(idx)}
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                                                            {idx + 1}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* File input with drag and drop */}
                            <div className="space-y-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-input"
                                    disabled={selectedFiles.length >= 10}
                                />

                                {/* Drag and drop area */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={handleLabelClick}
                                    className={`border-2 border-dashed rounded cursor-pointer text-center transition-all ${
                                        selectedFiles.length >= 10
                                            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                                            : isDragOver
                                            ? "bg-blue-50 border-blue-400 border-2"
                                            : "bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-blue-400 text-gray-600"
                                    }`}
                                >
                                    <div className="px-4 py-8">
                                        <Upload
                                            className={`mx-auto mb-3 ${isDragOver ? "text-blue-500" : ""}`}
                                            size={32}
                                        />
                                        <div className="font-medium text-lg mb-1">
                                            {isDragOver ? "Drop files here" : "Choose Files"}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {selectedFiles.length >= 10
                                                ? "Maximum files reached"
                                                : "Click to browse or drag and drop files here"}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-2">Supports all file types</div>
                                    </div>
                                </div>

                                {/* Upload button */}
                                <button
                                    onClick={handleUpload}
                                    disabled={loading || selectedFiles.length === 0}
                                    className={`w-full px-4 py-3 rounded text-white font-medium ${
                                        loading || selectedFiles.length === 0
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-500 hover:bg-blue-600"
                                    } transition-colors`}
                                >
                                    {loading
                                        ? "Uploading..."
                                        : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? "s" : ""}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UploadButton;
