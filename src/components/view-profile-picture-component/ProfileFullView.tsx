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
        className=" w-full md:w-md h-[50vh]  bg-white flex flex-col items-center  rounded-md border border-zinc-500 shadow-2xl overflow-hidden"
      >
        <div className="w-full h-10  flex items-center justify-between p-4  ">
          <h1 className="font-semibold">View profile</h1>
          <X
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="cursor-pointer"
          />
        </div>
        <div className="w-full h-full  ">
          <img
            src={src || Avatar}
            alt="Profile image"
            className="w-full h-full object-cover  "
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileFullView;
