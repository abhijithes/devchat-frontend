import { FileText, FileSpreadsheet, FileType, FileArchive } from "lucide-react";

const getDocMeta = (file: any) => {
    const ext = file.format || file.originalName?.split(".").pop()?.toLowerCase();

    switch (ext) {
        case "pdf":
            return { label: "PDF", color: "bg-red-100 text-red-600", icon: FileType };
        case "doc":
        case "docx":
            return { label: "DOC", color: "bg-blue-100 text-blue-600", icon: FileText };
        case "xls":
        case "xlsx":
            return {
                label: "XLS",
                color: "bg-green-100 text-green-600",
                icon: FileSpreadsheet,
            };
        case "zip":
            return {
                label: "ZIP",
                color: "bg-yellow-100 text-yellow-700",
                icon: FileArchive,
            };
        default:
            return { label: "FILE", color: "bg-gray-100 text-gray-600", icon: FileText };
    }
};

const AttachmentBox = ({ files }: { files?: any[] }) => {
    if (!files || files.length === 0) return null;
    const isImageFile = (file: any) => file.type === "image" || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.url);
    const images = files.filter(isImageFile);
    const documents = files.filter((f) => !isImageFile(f));

    return (
        <div className="w-full space-y-2">
            {/* 🖼 Images */}
            {images.length > 0 && (
                <div className="w-full max-h-60 md:w-100 lg:max-h-140 rounded-lg overflow-hidden">
                    <div
                        className={`grid w-full h-full gap-1 ${
                            images.length === 1
                                ? "grid-cols-1"
                                : images.length === 2
                                ? "grid-cols-2"
                                : "grid-cols-2 grid-rows-2"
                        }`}
                    >
                        {images.slice(0, 4).map((file, index) => (
                            <div
                                key={index}
                                className={`relative rounded-lg overflow-hidden ${
                                    images.length === 3 && index === 0 ? "row-span-2" : ""
                                }`}
                            >
                                <img
                                    src={file.url}
                                    alt={`attachment-${index}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 📄 Documents */}
            {documents.length > 0 && (
                <div className="flex flex-col gap-2">
                    {documents.map((file, index) => {
                        const meta = getDocMeta(file);
                        const Icon = meta.icon;

                        return (
                            <a
                                key={index}
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 rounded-lg border ${meta.color} hover:opacity-90`}
                            >
                                <Icon className="w-6 h-6" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{meta.label}</span>
                                    <span className="text-xs truncate max-w-[220px]">
                                        {file.originalName || "Document"}
                                    </span>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AttachmentBox;
