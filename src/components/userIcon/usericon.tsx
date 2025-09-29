import { useMemo } from "react";

export interface UserIconProps {
    user: { firstName: string, email: string, _id: string, profilePicture?: string }
}

const UserIcon: React.FC<UserIconProps> = ({ user }) => {

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
        if (user.firstName) {
            const charCodeSum = user.firstName.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
            console.log(charCodeSum);
            
            return colors[charCodeSum % colors.length];
        }

    }, [user.firstName]);

    if (!user.firstName || user.firstName.trim().length === 0) return null;

    return (
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${color} text-white border-2 border-white font-bold cursor-pointer`}
        >
            {user.firstName?.trim().charAt(0).toUpperCase()}
        </div>
    );
};

export default UserIcon;
