import { useState } from "react";

const ReadMore = ({ text, limit = 180 }) => {
    const [expanded, setExpanded] = useState(false);
    if (text.length <= limit) return <p className="whitespace-pre-wrap pl-1 md:pl-3 pt-1">{text}</p>;

    return (
        <div className="whitespace-pre-wrap pl-3">
            {expanded ? text : text.slice(0, limit) + "..."}

            <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 ml-2 cursor-pointer hover:underline"
            >
                {expanded ? "Read less" : "Read more"}
            </button>
        </div>
    );
};

export default ReadMore;
