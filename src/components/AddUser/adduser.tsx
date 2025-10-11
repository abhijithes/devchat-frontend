import { useState } from "react";
import axios from "axios";
import { endpoints } from "../../constant/constant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackBar } from "../snack-bar/snack-bar-context";

interface User {
  _id: string;
  email: string;
  firstName?: string;
  profilePicture?: string;
}

interface AddUserProps {
  projectid: string;
  usertype: "member" | "manager";
  currentMembers?: User[];
}

const colors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A1",
  "#FFC733",
  "#33FFF5",
  "#B833FF",
  "#FF8333",
];

export default function AddUser({ projectid, usertype, currentMembers = [] }: AddUserProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [showCurrentMembers, setShowCurrentMembers] = useState(false);
    const queryClient = useQueryClient();
    const { showSnackBar } = useSnackBar();
export default function AddUser({
  projectid,
  usertype,
  currentMembers = [],
}: AddUserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showCurrentMembers, setShowCurrentMembers] = useState(false);
  const queryClient = useQueryClient();
  // const {} = SnackBar()

  // Search users query with debouncing
  const {
    data: filteredUsers = [],
    isLoading: loadingUsers,
    isError: searchError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users", searchTerm, usertype],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];

      // For manager mode, search within current members only
      if (usertype === "manager") {
        const searchLower = searchTerm.toLowerCase();
        const filtered = currentMembers.filter(
          (member) =>
            member.email.toLowerCase().includes(searchLower) ||
            member.firstName?.toLowerCase().includes(searchLower)
        );
        // Filter out already selected users
        return filtered.filter(
          (u: User) => !selectedUsers.some((s) => s._id === u._id)
        );
      }

      // For member mode, use the original API search
      const token = localStorage.getItem("token") || "";
      const response = await axios.get(
        `${endpoints.searchUser}?search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Filter out already selected users
      return response.data.filter(
        (u: User) => !selectedUsers.some((s) => s._id === u._id)
      );
    },
    enabled: false, // Manual triggering
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });

    // Add users mutation
    const addUsersMutation = useMutation({
        mutationFn: async (userIds: string[]) => {
            const response = await axios.patch(
                usertype == "member" ? endpoints.addmember(projectid) : endpoints.addmanager(projectid),
                {
                    userIds,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                    },
                }
            );
            return response.data;
        },
        onSuccess: (data) => {
            console.log("Users added successfully:", data);
            // Reset form
            setSelectedUsers([]);
            setSearchTerm("");
            setShowCurrentMembers(false);
            showSnackBar("User added successfully", "success", 3000);
            queryClient.invalidateQueries({ queryKey: ["project", projectid] });
        },
        onError: (error: Error) => {
            console.error("Error adding users:", error);
        },
    });
  // Add users mutation
  const addUsersMutation = useMutation({
    mutationFn: async (userIds: string[]) => {
      const response = await axios.patch(
        usertype == "member"
          ? endpoints.addmember(projectid)
          : endpoints.addmanager(projectid),
        {
          userIds,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Users added successfully:", data);
      // Reset form
      setSelectedUsers([]);
      setSearchTerm("");
      setShowCurrentMembers(false);
      queryClient.invalidateQueries({ queryKey: ["project", projectid] });
    },
    onError: (error: Error) => {
      console.error("Error adding users:", error);
    },
  });

  // Manual debounce for search
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);

    if (term.trim()) {
      const timeoutId = setTimeout(() => {
        refetchUsers();
      }, 400);

      return () => clearTimeout(timeoutId);
    }
  };

  const addUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchTerm("");
    setShowCurrentMembers(false);
  };

  const removeUser = (id: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== id));
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) return;

    const userIds = selectedUsers.map((u) => u._id);
    addUsersMutation.mutate(userIds);
  };

  const uploading = addUsersMutation.isPending;

  return (
    <div>
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">
          {usertype === "manager" ? "Managers" : "Members"}
        </label>

        {/* Show current members section for manager mode */}
        {usertype === "manager" && currentMembers.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 font-medium">
                Current Members ({currentMembers.length})
              </span>
              <button
                type="button"
                onClick={() => setShowCurrentMembers(!showCurrentMembers)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showCurrentMembers ? "Hide" : "Show"} members
              </button>
            </div>

            {showCurrentMembers && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {currentMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded cursor-pointer transition-colors"
                      onClick={() => addUser(member)}
                    >
                      <div className="flex items-center gap-3">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={member.firstName || member.email}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              backgroundColor:
                                colors[
                                  member._id.charCodeAt(0) % colors.length
                                ],
                            }}
                          >
                            {(member.firstName ||
                              member.email)[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm text-gray-700">
                          {member.firstName || member.email}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Add
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 sm:gap-6 items-start">
          {/* Selected users */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start">
            {selectedUsers.map((user, idx) => (
              <div
                key={user._id}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-white font-bold text-sm sm:text-lg ${
                  uploading
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer hover:opacity-80"
                }`}
                style={{ backgroundColor: colors[idx % colors.length] }}
                title={
                  uploading
                    ? "Upload in progress"
                    : `Click to remove ${user.email}`
                }
                onClick={() => !uploading && removeUser(user._id)}
              >
                {user.email[0].toUpperCase()}
              </div>
            ))}
            {selectedUsers.length === 0 && (
              <div className="text-gray-500 text-sm italic py-2">
                No {usertype === "manager" ? "managers" : "users"} selected
              </div>
            )}
          </div>

          {/* Search box + results */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={
                usertype === "manager"
                  ? "Search current members to make managers..."
                  : "Search person / group"
              }
              className="w-full p-3 bg-gray-200 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={uploading}
            />

            {/* Search results dropdown */}
            {searchTerm && (
              <div className="absolute w-full bg-white border border-gray-300 rounded-b-lg max-h-60 overflow-y-auto z-50 shadow-lg mt-1">
                {loadingUsers ? (
                  <div className="text-gray-500 text-sm p-3 text-center">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    {usertype === "manager"
                      ? "Searching members..."
                      : "Loading users..."}
                  </div>
                ) : searchError ? (
                  <div className="text-red-500 text-sm p-3 text-center">
                    Error loading users. Please try again.
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="py-2 px-3 cursor-pointer hover:bg-blue-50 text-gray-800 border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => addUser(user)}
                    >
                      <div className="font-medium">{user.email}</div>
                      {user.firstName && (
                        <div className="text-sm text-gray-600">
                          {user.firstName}
                        </div>
                      )}
                      {usertype === "manager" && (
                        <div className="text-xs text-green-600 mt-1">
                          Current Member
                        </div>
                      )}
                    </div>
                  ))
                ) : searchTerm.trim() ? (
                  <div className="text-gray-500 text-sm p-3 text-center">
                    {usertype === "manager"
                      ? `No current members found for "${searchTerm}"`
                      : `No users found for "${searchTerm}"`}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {addUsersMutation.isError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          Failed to add {usertype === "manager" ? "managers" : "members"}:{" "}
          {addUsersMutation.error?.message}
        </div>
      )}

      {addUsersMutation.isSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
          {usertype === "manager" ? "Managers" : "Members"} added successfully!
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={uploading || selectedUsers.length === 0}
        className={`bg-black text-white px-6 sm:px-10 py-3 rounded-md w-full transition-all ${
          uploading || selectedUsers.length === 0
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-zinc-800"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Adding {usertype === "manager" ? "Managers" : "Members"}...
          </div>
        ) : (
          `Add ${selectedUsers.length} ${
            usertype === "manager" ? "Manager" : "Member"
          }${selectedUsers.length !== 1 ? "s" : ""}`
        )}
      </button>

      {/* Selection Info */}
      {selectedUsers.length > 0 && !uploading && (
        <div className="mt-3 text-center text-sm text-gray-600">
          Ready to add {selectedUsers.length}{" "}
          {usertype === "manager" ? "manager" : "user"}
          {selectedUsers.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
