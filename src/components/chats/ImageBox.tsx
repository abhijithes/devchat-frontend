

const ImageBox = ({ files }: { files?: { url?: string }[] }) => {
  if (!files || files.length === 0) return null;
  
  return (
<div className="w-60 h-60 lg:w-100 lg:h-100 rounded-lg overflow-hidden">
  <div
    className={`
      grid w-full h-full gap-1
      ${
        files.length === 1
          ? "grid-cols-1 grid-rows-1"
          : files.length === 2
          ? "grid-cols-2 grid-rows-1"
          : files.length === 3
          ? "grid-cols-2 grid-rows-2"
          : "grid-cols-2 grid-rows-2"
      }
    `}
  >
    {files.slice(0, 4).map((file, index) => (
      <div
        key={index}
        className={`
          relative rounded-lg overflow-hidden
          ${
            files.length === 3 && index === 0
              ? "row-span-2"
              : ""
          }
        `}
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

  );
};

export default ImageBox;