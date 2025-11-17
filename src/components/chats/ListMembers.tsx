import { useEffect, useState } from "react";
import { getUserslist } from "../../services/chat-service";
import UserIcon from "../userIcon/usericon";
import Spinner from "../loaders/Spinner";
import { Add, SentimentDissatisfied } from "@mui/icons-material";
import DvcCheckBox from "../buttons/CheckBox";
import type { BaseUserInfo } from "../../constant/types";

const ListMembers = ({
  selectType = "single",
  onSubmit,
}: {
  selectType?: "single" | "multiple";
  onSubmit?: (selectedUsers: BaseUserInfo[]) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [usersList, setUsersList] = useState<BaseUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<BaseUserInfo[]>([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          setLoading(true);
          const response = await getUserslist(searchTerm);
          setUsersList(response?.data || []);
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const isSelected = (user: BaseUserInfo) => {
    return selectedUsers.some((u) => u._id === user._id);
  };

  const toggleSelect = (user: BaseUserInfo) => {
    if (selectType === "single") {
      // Single select - always replace
      setSelectedUsers([user]);
    } else {
      // Multiple select toggle logic
      if (isSelected(user)) {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  return (
    <div className="w-[80vw] sm:w-[80vw] lg:w-[30vw] py-2">
      {/* Search Input */}
      <input
        id="search-input"
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 mb-4 w-full input-field"
      />

      {/* No Users Found */}
      {!loading && usersList.length === 0 && (
        <p className="h-20 text-center text-zinc-500 centered gap-2 flex-col">
          <SentimentDissatisfied />
          No users found.{" "}
          <span className="text-xs text-zinc-400">search a name</span>
        </p>
      )}

      {/* Loader */}
      {loading && (
        <div className="w-full centered">
          <Spinner />
        </div>
      )}

      {/* Users List */}
      <ul className="max-h-[60vh] overflow-auto pr-2">
        {usersList?.map((user: BaseUserInfo) => (
          <li
            key={user._id}
            onClick={() => toggleSelect(user)}
            className={`flex justify-between gap-x-6 py-5 hover:bg-zinc-100 px-3 rounded-md cursor-pointer ${
              isSelected(user) ? "bg-zinc-200" : ""
            }`}
          >
            <div className="flex min-w-0 gap-x-4">
              <UserIcon user={user} />
              <div className="min-w-0 flex-auto">
                <p className="text-sm/6 font-semibold text-black truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-1 truncate text-xs/5 text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Checkbox for multiple select */}
            {selectType === "multiple" && (
              <div>
                <DvcCheckBox
                  checked={isSelected(user)}
                  onChange={() => toggleSelect(user)}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          onClick={() => {
            setSelectedUsers([]);
            onSubmit && onSubmit([]);
          }}
          className="!w-full mt-5 !py-3 input-grad-btn-invert disabled:opacity-55"
        >
          Cancel
        </button>
        <button
          disabled={selectedUsers.length === 0}
          onClick={() => {
            onSubmit(selectedUsers);
            setSelectedUsers([]);
          }}
          className="!w-full mt-5 !py-3 input-grad-btn disabled:opacity-55"
        >
          <Add /> Go to chat
        </button>
      </div>
    </div>
  );
};

export default ListMembers;
