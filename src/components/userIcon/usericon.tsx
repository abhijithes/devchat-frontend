import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export interface UserIconProps {
  user: {
    firstName: string;
    lastName?: string;
    email: string;
    _id: string;
    profilePicture?: string;
  };
  style?: string;
}

const UserIcon: React.FC<UserIconProps> = ({ user, style }) => {
  const navigation = useNavigate();
  const colors: string[] = [
    "bg-linear-to-r from-red-700  to-red-400",
    "bg-linear-to-r from-blue-700  to-blue-400",
    "bg-linear-to-r from-green-700  to-green-400",
    "bg-linear-to-r from-yellow-700  to-yellow-400",
    "bg-linear-to-r from-purple-700  to-purple-400",
    "bg-linear-to-r from-pink-700  to-pink-400",
    "bg-linear-to-r from-indigo-700  to-indigo-400",
    "bg-linear-to-r from-teal-700  to-teal-400",
  ];

  const handleNavigateToProfile = () => {
    navigation(`/viewprofile/${user._id}`);
  };

  const color = useMemo(() => {
    if (user.firstName) {
      const charCodeSum = user.firstName
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);

      return colors[charCodeSum % colors.length];
    }
  }, [user.firstName]);

  if (!user.firstName || user.firstName.trim().length === 0) return null;

  return (
    <div
      title={`View ${user.firstName}'s profile`}
      onClick={handleNavigateToProfile}
      className={`${
        style ?? "w-10 h-10"
      }  rounded-full flex items-center justify-center ${color} text-white border-2 border-white font-bold cursor-pointer overflow-hidden relative group`}
    >
      {!user.profilePicture ? (
        user.firstName?.trim().charAt(0).toUpperCase()
      ) : (
        <img
          src={user.profilePicture}
          alt={user.firstName}
          className="w-full h-full object-cover"
        />
      )}
      <div
        className={`${
          style ?? "w-10 h-10"
        }  centered  absolute top-0 left-0 rounded-full translate-full group-hover:bg-black/60 group-hover:translate-0 transition-all`}
      >
        <ChevronRight size={15} />
      </div>
    </div>
  );
};

export default UserIcon;
