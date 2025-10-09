import { useState } from "react";
import DeleteConformation from "../Conformation/DeleteConformation";
import { endpoints } from "../../constant/constant";

interface Document {
    fileName: string;
    originalName: string;
    fileUrl: string;
    _id?: String;
}

interface DocumentProps {
    documents?: Document[];
    className?: string;
    maxColumns?: number;
    ProjectId?: String;
    refetch: () => void;
}

const ProjectDocuments: React.FC<DocumentProps> = ({
    documents,
    className = "",
    maxColumns = 2,
    ProjectId,
    refetch,
}) => {
    const [deleteConformationOpen, setDeleteConformationOpen] = useState(false);
    const [deleteFileID, setDeleteFileId] = useState<String | null>();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClose = () => {
        setDeleteFileId(null);
        setDeleteConformationOpen(false);
    };

    const handedeletemodalopen = (docId) => {
        setDeleteFileId(docId);
        setDeleteConformationOpen(true);
    };

    const handleDelete = async () => {
        try {
            if (!deleteFileID) return;
            setIsDeleting(true);

            const res = await fetch(endpoints.deleteDoc(ProjectId, deleteFileID), {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!res.ok) throw new Error("Failed to delete document");
            refetch();
            handleClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!documents || documents.length === 0) {
        return (
            <div className={`text-center py-8 ${className} `}>
                <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <p className="text-gray-500 text-sm">No documents available</p>
            </div>
        );
    }

    const getFileIcon = (fileName: string) => {
        const extension = fileName?.split(".").pop()?.toLowerCase() || "file";

        const iconConfig = {
            pdf: { color: "text-red-500", bg: "bg-red-50", label: "PDF" },
            doc: { color: "text-blue-500", bg: "bg-blue-50", label: "DOC" },
            docx: { color: "text-blue-500", bg: "bg-blue-50", label: "DOC" },
            xls: { color: "text-green-500", bg: "bg-green-50", label: "XLS" },
            xlsx: { color: "text-green-500", bg: "bg-green-50", label: "XLS" },
            ppt: { color: "text-orange-500", bg: "bg-orange-50", label: "PPT" },
            pptx: { color: "text-orange-500", bg: "bg-orange-50", label: "PPT" },
            jpg: { color: "text-purple-500", bg: "bg-purple-50", label: "IMG" },
            jpeg: { color: "text-purple-500", bg: "bg-purple-50", label: "IMG" },
            png: { color: "text-purple-500", bg: "bg-purple-50", label: "IMG" },
            zip: { color: "text-yellow-500", bg: "bg-yellow-50", label: "ZIP" },
            default: { color: "text-gray-500", bg: "bg-gray-50", label: extension.toUpperCase() },
        };

        const config = iconConfig[extension as keyof typeof iconConfig] || iconConfig.default;

        return (
            <div className={`w-10 h-10 rounded-lg ${config.bg} ${config.color} flex items-center justify-center`}>
                <span className="font-semibold text-xs">{config.label}</span>
            </div>
        );
    };

    return (
        <div className={className}>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${maxColumns} gap-4`}>
                {documents.map((doc) => (
                    <div
                        key={doc.fileName}
                        className="bg-white hover:bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors duration-200"
                    >
                        <div className="flex items-start gap-3">
                            {getFileIcon(doc.originalName)}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate mb-1">{doc.originalName}</p>
                                <p className="text-xs text-gray-500 mb-3">
                                    {doc.originalName?.split(".").pop()?.toUpperCase()}
                                </p>

                                <div className="flex gap-2">
                                    <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                        title="Preview"
                                    >
                                        View
                                    </a>
                                    <a
                                        href={doc.fileUrl}
                                        download={doc.originalName}
                                        className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                            <button className="cursor-pointer" onClick={() => handedeletemodalopen(doc._id)}>
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {deleteConformationOpen && (
                <DeleteConformation
                    message="Orappikkavoo??"
                    onCancel={handleClose}
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
};
export default ProjectDocuments;
