import { X } from "lucide-react";
import Avatar from "../../assets/avatar.jpg";

const ProfileFullView = ({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) => {
  return (
    <div
      onClick={onClose}
      className="w-full h-screen bg-black/50 grid place-items-center-safe fixed top-0 left-0 z-40"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className=" w-full md:w-md min-h-1/2 max-h-[70%] h-max bg-white flex flex-col items-center  rounded-md border border-zinc-500 shadow-2xl overflow-hidden"
      >
        <div className="w-full h-10  flex items-center justify-between px-5 ">
          <h1>View profile</h1>
          <X
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="cursor-pointer"
          />
        </div>
        <img
          src={src || Avatar}
          alt="Profile image"
          className="h-full object-contain"
        />
      </div>
    </div>
  );
};

export default ProfileFullView;
