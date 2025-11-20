import React from "react";

interface TypingIndicatorProps {
    users?: string[]; // Array of users who are typing
    show?: boolean; // Control visibility
    className?: string; // Additional styling
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users = [], show = false, className = "" }) => {
    if (!show || users.length === 0) return null;

    const getMessage = () => {
        if (users.length === 1) {
            return `${users[0]} is typing`;
        } else if (users.length === 2) {
            return `${users[0]} and ${users[1]} are typing`;
        } else {
            return `${users.length} people are typing`;
        }
    };

    return (
        <div className={`flex items-center space-x-2 p-3 ${className}`}>
            <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                ></div>
            </div>
            <span className="text-sm text-gray-600 font-medium">{getMessage()}</span>
        </div>
    );
};

export default TypingIndicator;
