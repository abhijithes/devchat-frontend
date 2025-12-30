import { useState } from "react";

const linkify = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);

    return parts.map((part, index) =>
        part.match(/^https?:\/\//) ? (
            <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-700 break-all"
            >
                {part}
            </a>
        ) : (
            <span key={index}>{part}</span>
        )
    );
};

const ReadMore = ({ text, limit = 180 }: { text: string; limit?: number }) => {
    const [expanded, setExpanded] = useState(false);

    if (text.length <= limit) {
        return <p className="whitespace-pre-wrap pl-1 md:pl-3 pt-1">{linkify(text)}</p>;
    }

    const displayText = expanded ? text : text.slice(0, limit) + "...";

    return (
        <div className="whitespace-pre-wrap pl-1 md:pl-3 pt-1">
            {linkify(displayText)}

            <button
                onClick={() => setExpanded(!expanded)}
                className="ml-2 cursor-pointer text-blue-600 hover:underline"
            >
                {expanded ? "Read less" : "Read more"}
            </button>
        </div>
    );
};

export default ReadMore;
