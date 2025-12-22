import { ChevronRight } from "lucide-react";
import { useMemo } from "react";

export interface GroupIconProps {
  groupName: string;
  style?: string;
  onClick?: () => void;
}

const GroupIcon: React.FC<GroupIconProps> = ({ groupName, style, onClick }) => {
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
    onClick();
  };

  const color = useMemo(() => {
    if (groupName) {
      const charCodeSum = groupName
        .split("")
        .reduce((sum, char) => sum + char.charCodeAt(0), 0);

      return colors[charCodeSum % colors.length];
    }
  }, [groupName]);

  if (!groupName || groupName.trim().length === 0) return null;

  return (
    <div
      title={`View ${groupName}'s profile`}
      onClick={handleNavigateToProfile}
      className={`${
        style ?? "w-10 h-10"
      }  rounded-full flex items-center justify-center ${color} text-white border-2 border-white font-bold cursor-pointer overflow-hidden relative group shrink-0`}
    >
      {groupName?.trim().charAt(0).toUpperCase()}
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

export default GroupIcon;
