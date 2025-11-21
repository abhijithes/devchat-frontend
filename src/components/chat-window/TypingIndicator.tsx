// CompactTypingIndicator.tsx
import React from "react";

interface User {
    id: string;
    firstName: string;
    profilePicture?: string;
}

interface CompactTypingIndicatorProps {
    users: User[];
    show?: boolean;
    className?: string;
}

const CompactTypingIndicator: React.FC<CompactTypingIndicatorProps> = ({
    users = [],
    show = false,
    className = "",
}) => {
    if (!show || users.length === 0) return null;

    return (
        <div className={`flex items-center gap-2 px-3 py-2 ${className}`}>
            {/* Single Avatar */}
            {users[0] && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0">
                    {users[0].profilePicture ? (
                        <img
                            src={users[0].profilePicture}
                            alt={users[0].firstName}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full flex items-center justify-center text-white text-xs">
                            {users[0].firstName.charAt(0)}
                        </div>
                    )}
                </div>
            )}

            {/* Dot Animation */}
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                ></div>
            </div>

            {/* Text */}
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                {users.length === 1 ? `${users[0].firstName} is typing...` : `${users.length} people typing...`}
            </span>
        </div>
    );
};

export default CompactTypingIndicator;
