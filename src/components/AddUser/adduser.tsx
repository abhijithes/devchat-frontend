import { useState, useEffect } from "react";
import axios from "axios";
import { endpoints } from "../../constant/constant";

interface User {
    _id: string;
    email: string;
}

const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC733", "#33FFF5", "#B833FF", "#FF8333"];

export default function AddUser() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Fetch users when search term changes
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers([]);
            return;
        }

        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const { data } = await axios.get(`${endpoints.users}?search=${encodeURIComponent(searchTerm)}`);
                // Avoid showing already selected users
                const available = data.filter((u: User) => !selectedUsers.some((s) => s._id === u._id));
                setFilteredUsers(available);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoadingUsers(false);
            }
        };

        const debounce = setTimeout(fetchUsers, 400);
        return () => clearTimeout(debounce);
    }, [searchTerm, selectedUsers]);

    const addUser = (user: User) => {
        setSelectedUsers([...selectedUsers, user]);
        setSearchTerm("");
        setFilteredUsers([]);
    };

    const removeUser = (id: string) => {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== id));
    };

    const handleSubmit = async () => {
        if (selectedUsers.length === 0) return;
        setUploading(true);
        try {
            const { data } = await axios.post(endpoints.addUsers, {
                users: selectedUsers.map((u) => u._id),
            });
            console.log("Users added successfully:", data);
            // Reset
            setSelectedUsers([]);
            setSearchTerm("");
        } catch (err) {
            console.error("Error adding users:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <label className="block text-gray-700 mb-2">Peoples</label>
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-start">
                    {/* Selected users */}
                    <div className="flex flex-wrap gap-3">
                        {selectedUsers.map((user, idx) => (
                            <div
                                key={user._id}
                                className="w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg cursor-pointer"
                                style={{ backgroundColor: colors[idx % colors.length] }}
                                title="Click to remove"
                                onClick={() => removeUser(user._id)}
                            >
                                {user.email[0].toUpperCase()}
                            </div>
                        ))}
                    </div>

                    {/* Search box + results */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search person / group"
                            className="w-full p-3 bg-gray-200 border border-gray-300 rounded-t-lg text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <div className="absolute w-full bg-white border border-gray-300 rounded-b-lg max-h-60 overflow-y-auto z-50">
                                {loadingUsers ? (
                                    <div className="text-gray-500 text-sm p-2">Loading...</div>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user._id}
                                            className="py-1 px-2 cursor-pointer hover:bg-blue-200 bg-blue-100 text-gray-800"
                                            onClick={() => addUser(user)}
                                        >
                                            {user.email}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-sm p-2">No users found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={uploading}
                className={`bg-black text-white px-10 py-3 rounded-md w-full ${
                    uploading && "opacity-50 cursor-not-allowed"
                }`}
            >
                {uploading ? "Uploading..." : "Start"}
            </button>
        </div>
    );
}
