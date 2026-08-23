import { useState } from "react";

const STORAGE_KEY = "chatSidebarExpanded";

export const getSidebarExpanded = (): boolean => {
    try {
        return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
        return false;
    }
};

export const setSidebarExpanded = (value: boolean) => {
    try {
        localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
        // ignore
    }
};

export const ChatSettingsContent = () => {
    const [expanded, setExpanded] = useState(getSidebarExpanded);

    const handleToggle = () => {
        const next = !expanded;
        setExpanded(next);
        setSidebarExpanded(next);
        window.dispatchEvent(new Event("sidebarPreferenceChanged"));
    };

    return (
        <div className="flex flex-col gap-4 mt-2">
            {/* Sidebar expand/collapse toggle */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600">Expand chat list</span>
                <button
                    onClick={handleToggle}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        expanded ? "bg-violet-500" : "bg-zinc-300"
                    }`}
                >
                    <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                            expanded ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                </button>
            </div>
        </div>
    );
};
