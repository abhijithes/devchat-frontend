import React, { useState, useEffect } from "react";
import { FileMinus, X } from "lucide-react";
import { api_url, dev_api_url } from "../constant/constant"; 

interface User {
  _id: string;
  name: string;
}

interface AddProjectProps {
  onClose: () => void;
}

const AddProject: React.FC<AddProjectProps> = ({ onClose }) => {
  const [projectName, setProjectName] = useState("");
  const [expectedDays, setExpectedDays] = useState<number | "">("");
  const [projectDescription, setProjectDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const colors = ["#3b5998", "#00acee", "#ff69b4", "#ffa500", "#4caf50"];

  // -------------------------
  // Optimized Debounced Search
  // -------------------------
  useEffect(() => {
    const controller = new AbortController(); // to cancel previous fetches
    const handler = setTimeout(() => {
      if (!searchTerm.trim()) {
        setFilteredUsers([]);
        return;
      }

      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          const res = await fetch(
            `${api_url}/api/users/searchUser?search=${encodeURIComponent(
              searchTerm
            )}`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error("Failed to fetch users");

          const data: User[] = await res.json();

          const filtered = data.filter(
            (u) => !selectedUsers.find((s) => s._id === u._id)
          );

          // Sort: names starting with search term first
          const searchLower = searchTerm.toLowerCase();
          const sorted = filtered.sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(searchLower);
            const bStarts = b.name.toLowerCase().startsWith(searchLower);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.name.localeCompare(b.name);
          });

          setFilteredUsers(sorted);
        } catch (err: any) {
          if (err.name !== "AbortError") console.error(err);
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }, 500);

    return () => {
      controller.abort(); // cancel previous request
      clearTimeout(handler); // clear debounce
    };
  }, [searchTerm, selectedUsers]);

  // -------------------------
  // Add / Remove Users
  // -------------------------
  const addUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchTerm("");
    setFilteredUsers([]);
  };

  const removeUser = (id: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== id));
  };

  // -------------------------
  // Submit Project
  // -------------------------
  const handleSubmit = async () => {
    if (!projectName) return alert("Project name required");
    if (!expectedDays) return alert("Expected days required");
    if (selectedUsers.length === 0) return alert("Select at least one user");

    const newProject = {
      name: projectName,
      expectedDays: Number(expectedDays),
      assignedUsers: selectedUsers.map((u) => u._id),
      description: projectDescription,
    };

    try {
      const res = await fetch(
        `${dev_api_url}/api/projects/createProject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "authorization": `Bearer ${localStorage.getItem("token") || ""}` },
          body: JSON.stringify(newProject),
        }
      );

      if (!res.ok) throw new Error("Failed to create project");

      const data = await res.json();
      console.log("✅ Project created:", data);
      alert("✅ Project submitted to backend!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit project");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-40 p-4">
      <div className="bg-white w-full max-w-4xl border border-black shadow-xl mt-5 relative p-6 animate-slideIn max-h-[100vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-poppins mb-6">Add project</h2>

        {/* Project fields */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side */}
          <div className="w-full md:w-1/2">
            <div className="mb-4">
              <label className="block text-black">Project name</label>
              <input
                type="text"
                placeholder="Project name"
                className="w-full mt-1 border border-gray-300 px-3 py-2 bg-[rgba(217,217,217,1)]"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <input
                type="number"
                placeholder="Expected time in days"
                className="w-full mt-1 border border-gray-300 px-3 py-2 bg-[rgba(217,217,217,1)]"
                value={expectedDays}
                onChange={(e) =>
                  setExpectedDays(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>
          </div>

          {/* Right side */}
          <div className="w-full md:w-1/2">
            <label className="block text-black">Project description</label>
            <textarea
              placeholder="Enter project description..."
              className="w-full h-32 md:h-[90%] mt-1 border border-gray-300 px-3 py-2 bg-[rgba(217,217,217,1)] resize-none"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Document section */}
        <div className="flex items-center gap-2 mt-4 mb-6 cursor-pointer">
          <FileMinus />
          <div className="flex flex-col items-start">
            <p>Download</p>
            <p className="text-sm text-gray-600">Attached Document +</p>
          </div>
        </div>

        {/* Peoples Section */}
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
                  {user.name[0].toUpperCase()}
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
                        {user.name}
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

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-10 py-3 rounded-md w-full"
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default AddProject;
