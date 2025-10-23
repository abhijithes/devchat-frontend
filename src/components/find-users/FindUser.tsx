import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface User {
    _id: number | string;
    name?: string;
    email?: string;
}

interface Props {
    selectType?: "single" | "multiple";
    users?: User[];
    activeStyle?: string;
    pannelStyle?: string;
    inputStyle?: string;
    onUserSelect: (users: User[] | User) => void;
    defaultValue?: string;
}

const FindUser = ({
    selectType = "single",
    activeStyle,
    pannelStyle,
    inputStyle,
    users = [],
    onUserSelect,
    defaultValue,
}: Props) => {
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [filtered, setFiltered] = useState<User[]>(users);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [input, setInput] = useState(defaultValue ?? "");

    // Debounce search filtering
    useEffect(() => {
        const timeout = setTimeout(() => {
            const search = input.toLowerCase();
            const result = users.filter(
                (user) => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
            );
            setFiltered(result);
        }, 200);
        console.log(defaultValue);

        return () => clearTimeout(timeout);
    }, [input, users]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSelectUser = (user: User) => {
        if (selectType === "single") {
            setSelectedUsers([user]);
            setInput(user.email || user.name);
            onUserSelect(user);
        } else {
            setSelectedUsers((prev) =>
                prev.find((u) => u._id === user._id) ? prev.filter((u) => u._id !== user._id) : [...prev, user]
            );
        }
    };

    const submitSelection = () => {
        onUserSelect(selectType === "single" ? selectedUsers[0] : selectedUsers);
        setDropdownOpen(false);
    };

    return (
        <div className={` w-full h-max max-h-36 mt-1 overflow-auto bg-inherit ${pannelStyle}`}>
            <div className={` w-full flex bg-white p-2 border border-zinc-300 sticky top-0 ${inputStyle}`}>
                <input
                    type="text"
                    required
                    className="w-full outline-none"
                    placeholder="Search user..."
                    onChange={handleInputChange}
                    value={input}
                    onClick={() => setDropdownOpen(true)}
                />
                <div
                    onClick={dropdownOpen ? submitSelection : () => setDropdownOpen(true)}
                    className="ml-2  hover:bg-zinc-800 hover:text-white grid place-items-center p-1 rounded cursor-pointer"
                >
                    {dropdownOpen ? <Check size={17} /> : <ChevronDown size={17} />}
                </div>
            </div>

            {dropdownOpen &&
                filtered.map((user) => {
                    const isSelected = selectedUsers.some((u) => u._id === user._id);
                    return (
                        <div
                            key={user._id}
                            className={`p-2 border-b border-gray-300 mt-2 cursor-pointer ${
                                isSelected ? activeStyle || "text-white bg-zinc-800" : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleSelectUser(user)}
                        >
                            {user.email ? user.email : user.name}
                        </div>
                    );
                })}
        </div>
    );
};

export default FindUser;
