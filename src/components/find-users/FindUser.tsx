import { Check } from "lucide-react";
import { useState } from "react";

interface Props {
  selectType?: "single" | "multiple";
  users?: any | User[];
  activeStyle?: string;
  onUserSelect: (users: any) => void;
}

interface User {
  _id: number | string;
  name: string;
}
const FindUser = ({
  selectType = "single",
  activeStyle,
  users = [],
  onUserSelect,
}: Props) => {
  const [selectedUsers, setSelectedUsers] = useState<User[] | []>([]);
  const [filtered, setFiltered] = useState<User[] | []>(users);

  const handleSearchUser = (e) => {
    setFiltered(
      users.filter(
        (user: User) =>
          user.name.toLowerCase().includes(e.target.value.toLowerCase()) ??
          users
      )
    );
  };

  const handleSelectUser = (user) => {
    setSelectedUsers((prevSelected) => {
      if (selectType === "single") {
        return [user];
      } else {
        if (prevSelected.find((u: User) => u._id === user._id)) {
          return prevSelected.filter((u: User) => u._id !== user._id);
        } else {
          return [...prevSelected, user];
        }
      }
    });
  };

  return (
    <div className="w-full h-max max-h-56 mt-1 absolute top-full left-0 overflow-auto bg-inherit ">
      <div className="w-full flex sticky top-0 ">
        <input
          type="text"
          className="w-full h-full bg-white p-2 border border-zinc-300 outline-none"
          placeholder="Search user..."
          onChange={handleSearchUser}
        />
        <div
          onClick={() => onUserSelect(selectedUsers)}
          className=" bg-white border border-zinc-300 hover:bg-green-300 p-2 grid place-items-center"
        >
          <Check size={17} />
        </div>
      </div>
      {filtered.map((user) => (
        <div
          key={user._id}
          className={`p-2 border-b border-gray-300  ${
            selectedUsers.find((item: User) => item._id === user._id)
              ? activeStyle || " text-white bg-zinc-800 "
              : "hover:bg-gray-100"
          }  `}
          onClick={() => handleSelectUser(user)}
        >
          {user.name}
        </div>
      ))}
    </div>
  );
};

export default FindUser;
