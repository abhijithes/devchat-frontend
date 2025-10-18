import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
export const ProjectBox = ({
    id,
    name,
    description,
    role,
}: {
    id: string;
    name: string;
    description: string;
    role: string;
}) => {
    const { isDragging, attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transition: isDragging ? transition : undefined,
        transform: CSS.Transform.toString(transform),
    };
    return (
        <div
            className="project-box m-2 px-2 py-3 border-2 border-zinc-500 rounded-sm h-30"
            ref={setNodeRef}
            style={style}
        >
            <div className="flex justify-between items-center">
                <svg
                    aria-hidden="true"
                    height="16"
                    viewBox="0 0 16 16"
                    version="1.1"
                    width="16"
                    data-view-component="true"
                    className="octicon octicon-repo mr-1 color-fg-muted"
                >
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                </svg>
                <span className="flex-left flex-1 gap-2 ml-1">
                    <p className="text-lg font-semibold text-accent">{name}</p>
                    <span className="w-auto border border-zinc-600 px-2 rounded-full text-sm font-medium">{role}</span>
                </span>
                <svg
                    aria-hidden="true"
                    height="16"
                    viewBox="0 0 16 16"
                    version="1.1"
                    width="16"
                    data-view-component="true"
                    className={`octicon octicon-grabber ${
                        isDragging ? "cursor-grabbing" : "cursor-grab"
                    } focus:outline-0`}
                    {...attributes}
                    {...listeners}
                >
                    <path d="M10 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm-4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm5-9a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
                </svg>
            </div>
            <p className=" text-gray-800 text-sm line-clamp-3 mt-2">{description}</p>
        </div>
    );
};
