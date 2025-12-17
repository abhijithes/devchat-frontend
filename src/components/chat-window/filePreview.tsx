import Spinner from "../loaders/Spinner";
import { FileText, FileSpreadsheet, FileType, FileArchive, X } from "lucide-react";

const FILE_TYPE_MAP = {
    pdf: {
        label: "PDF",
        color: "bg-red-100 text-red-600 border-red-300",
        icon: FileType,
    },
    doc: {
        label: "DOC",
        color: "bg-blue-100 text-blue-600  border-blue-300",
        icon: FileText,
    },
    docx: {
        label: "DOCX",
        color: "bg-blue-100 text-blue-600  border-blue-300",
        icon: FileText,
    },
    xls: {
        label: "XLS",
        color: "bg-green-100 text-green-600  border-green-300",
        icon: FileSpreadsheet,
    },
    xlsx: {
        label: "XLSX",
        color: "bg-green-100 text-green-600  border-green-300",
        icon: FileSpreadsheet,
    },
    zip: {
        label: "ZIP",
        color: "bg-yellow-100 text-yellow-700  border-yellow-300",
        icon: FileArchive,
    },
    default: {
        label: "FILE",
        color: "bg-gray-100 text-gray-600  border-gray-300",
        icon: FileText,
    },
};

interface FilePreviewType {
    FilePreviews: any[];
    removeFile: (index: number) => void;
    isPending: boolean;
}

export const FilePreview: React.FC<FilePreviewType> = ({ FilePreviews, removeFile, isPending }) => {
    const getFileExtension = (fileName: string) => fileName.split(".").pop()?.toLowerCase();
    return (
        <div className="file-preview w-full flex overflow-x-auto">
            {FilePreviews &&
                FilePreviews.map((file, index) => (
                    <div
                        key={index}
                        className={`mr-2 mb-2 border border-gray-300 rounded-lg bg-gray-100 relative ${
                            FilePreviews.length < 2 && file.type.startsWith("image/")
                                ? `h-35 ${file.type.startsWith("image/") ? "w-35" : "w-50 max-w-60"}`
                                : `h-20 ${file.type.startsWith("image/") ? "w-20" : "w-60"}`
                        }`}
                    >
                        <X
                            className="absolute top-[2px] right-[2px] cursor-pointer text-black bg-white rounded-full font-bold"
                            size={18}
                            fontWeight={900}
                            onClick={() => removeFile(index)}
                        />
                        {isPending ? (
                            <Spinner style="h-2 w-2 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]" />
                        ) : (
                            ""
                        )}
                        {file.type.startsWith("image/") ? (
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                        ) : (
                            (() => {
                                const ext = getFileExtension(file.name);
                                const config = FILE_TYPE_MAP[ext] || FILE_TYPE_MAP.default;
                                const Icon = config.icon;

                                return (
                                    <div
                                        className={`w-full h-full rounded-lg flex gap-2 items-center justify-center text-center px-2 ${config.color}`}
                                    >
                                        <div className={`w-16 h-16 border ${config.color} centered rounded-lg`}>
                                            <Icon className="w-6 h-6 mb-1" />
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <p className="text-[10px] truncate self-start">{file.name}</p>
                                            <span className="text-xs font-semibold self-start">{config.label}</span>
                                        </div>
                                    </div>
                                );
                            })()
                        )}
                    </div>
                ))}
        </div>
    );
};
