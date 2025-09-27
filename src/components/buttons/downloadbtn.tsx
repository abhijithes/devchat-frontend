interface DocumentProps {
  documents?: {
    fileName: string;
    originalName: string;
    fileUrl: string;
  }[];
}

const ProjectDocuments: React.FC<DocumentProps> = ({ documents }) => {
  if (!documents || documents.length === 0) return <p className="my-5">No documents available.</p>;

  const getFileTypeIcon = (ext: string) => {
    switch (ext) {
      case "pdf":
        return <span className="w-20 h-20 bg-red-200 flex items-center justify-center text-red-600 font-bold">PDF</span>;
      case "doc":
      case "docx":
        return <span className="w-20 h-20 bg-blue-200 flex items-center justify-center text-blue-600 font-bold">DOC</span>;
      default:
        return <span className="w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-600 font-bold">{ext?.toUpperCase()}</span>;
    }
  };

  return (
    <div className="space-y-2 ">
      {documents.map((doc) => {
        const fileExt = doc.originalName.split(".").pop()?.toLowerCase();

        return (
          <div key={doc.fileName} className="flex items-center space-x-2 border p-2 rounded">
            {/* Preview */}
            {fileExt === "png" || fileExt === "jpg" || fileExt === "jpeg" ? (
              <img
                src={doc.fileUrl}
                alt={doc.originalName}
                className="w-20 h-20 object-cover rounded"
              />
            ) : (
              getFileTypeIcon(fileExt || "")
            )}

            {/* Name */}
            <span className="flex-1">{doc.originalName}</span>

            {/* Download */}
            <a
              href={doc.fileUrl}
              download={doc.originalName}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Download
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectDocuments;
