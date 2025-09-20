import { useMemo } from "react";

interface UserIconProps {
    name: string;
}

const UserIcon: React.FC<UserIconProps> = ({ name }) => {
    const colors: string[] = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-indigo-500",
        "bg-teal-500",
    ];

    const color = useMemo(() => {
        const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[charCodeSum % colors.length];
    }, [name]);

    if (!name || name.trim().length === 0) return null;

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} text-white font-bold cursor-pointer`}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
};

export default UserIcon;
