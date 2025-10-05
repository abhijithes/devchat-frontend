import { useEffect, useRef } from "react";
import { current_url } from "../../constant/constant";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import avatar from "../../assets/avatar.jpg";
import { CircularProgress } from "@mui/material";
import { Edit, Save, Cancel, CloudUpload } from "@mui/icons-material";
import { useLoader } from "../../contexts/GlobalLoaderContext";

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  about?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserType | null>(null);
  const [userCopy, setUserCopy] = useState<UserType | null>(null);
  const [preview, setPreview] = useState<string | null>(avatar);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pfpLoading, setPfpLoading] = useState(false);
  const [editableFields, setEditableFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    about: false,
  });
  const { showLoader, hideLoader } = useLoader();

  const jwttoken = localStorage.getItem("token");
  if (!jwttoken) {
    window.location.href = "/login";
  }
  const decoded = jwtDecode(jwttoken) || {};
  const { id } = decoded as { id: string };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        showLoader();
        const res = await fetch(`${current_url}/users/${id}`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        });
        const data = await res.json();
        setUser(data);
        setUserCopy(data);
      } catch (err) {
        console.log(err);
      } finally {
        hideLoader();
      }
    };

    fetchUserProfile();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    setPfpLoading(true);

    try {
      const res = await fetch(`${current_url}/upload`, {
        method: "POST",
        body: formData,
        headers: {
          authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const pfpUrl = await res.json();
      if (!res.ok) {
        console.error("Upload failed:", pfpUrl.message);
        return;
      }

      const updateRes = await fetch(`${current_url}/users/Update/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ profilePicture: pfpUrl.files[0].url }),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const data = await updateRes.json();
      if (updateRes.ok) {
        setUser((prev) =>
          prev ? { ...prev, profilePicture: data.profilePicture } : null
        );
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
    } finally {
      setPfpLoading(false);
    }
  };

  const handleEdit = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${current_url}/users/update/${id}`, {
        method: "PATCH",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setUserCopy(data);
        setEditableFields({
          firstName: false,
          lastName: false,
          email: false,
          about: false,
        });
      } else {
        console.error("Update failed:", data.message);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const hasChanges =
    user && userCopy && JSON.stringify(user) !== JSON.stringify(userCopy);

  if (!user) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="animate-pulse">
          <p className="text-gray-500">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-l from-zinc-50  to-white rounded-t-2xl  border border-b-0 border-gray-100 p-8 ">
        <div className="flex flex-col md:flex-row items-center gap-8 ">
          {/* Profile Picture */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-xl border-4 border-white  overflow-hidden">
              <img
                src={user.profilePicture || preview || avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {pfpLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <CircularProgress size={30} className="text-white" />
                </div>
              )}
            </div>
            <button
              onClick={() => inputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-gradient-to-r from-zinc-800 to-zinc-600 text-white p-2 rounded-full  hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <CloudUpload className="w-5 h-5" />
            </button>
            <input
              type="file"
              className="hidden"
              ref={inputRef}
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 mb-3 flex items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Member since{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-700 leading-relaxed">
              {user.about || "No bio yet. Write something about yourself!"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white   border border-t-0 border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setUser(userCopy)}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                hasChanges
                  ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                  : "border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Cancel className="w-5 h-5" />
              Reset
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-200 ${
                hasChanges
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover: transform hover:scale-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* First Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <label className="text-lg font-semibold text-gray-700 min-w-[120px]">
              First Name
            </label>
            <div className="flex-1 flex items-center gap-3">
              <input
                type="text"
                maxLength={30}
                value={user.firstName}
                name="firstName"
                onChange={handleEdit}
                className={`flex-1 bg-transparent text-lg outline-none transition-all duration-200 ${
                  editableFields.firstName
                    ? "border-b-2 border-blue-500 pb-1"
                    : "border-b border-transparent"
                }`}
                disabled={!editableFields.firstName}
              />
              <button
                onClick={() =>
                  setEditableFields((prev) => ({
                    ...prev,
                    firstName: !editableFields.firstName,
                  }))
                }
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Last Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <label className="text-lg font-semibold text-gray-700 min-w-[120px]">
              Last Name
            </label>
            <div className="flex-1 flex items-center gap-3">
              <input
                type="text"
                maxLength={30}
                value={user.lastName}
                onChange={handleEdit}
                name="lastName"
                className={`flex-1 bg-transparent text-lg outline-none transition-all duration-200 ${
                  editableFields.lastName
                    ? "border-b-2 border-blue-500 pb-1"
                    : "border-b border-transparent"
                }`}
                disabled={!editableFields.lastName}
              />
              <button
                onClick={() =>
                  setEditableFields((prev) => ({
                    ...prev,
                    lastName: !editableFields.lastName,
                  }))
                }
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <label className="text-lg font-semibold text-gray-700 min-w-[120px]">
              Email
            </label>
            <div className="flex-1 flex items-center gap-3">
              <input
                type="email"
                value={user.email}
                onChange={handleEdit}
                name="email"
                className={`flex-1 bg-transparent text-lg outline-none transition-all duration-200 ${
                  editableFields.email
                    ? "border-b-2 border-blue-500 pb-1"
                    : "border-b border-transparent"
                }`}
                disabled={!editableFields.email}
              />
              <button
                onClick={() =>
                  setEditableFields((prev) => ({
                    ...prev,
                    email: !editableFields.email,
                  }))
                }
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200"
              >
                <Edit className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* About */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <label className="text-lg font-semibold text-gray-700 min-w-[120px] sm:mt-2">
              About
            </label>
            <div className="flex-1 flex flex-col gap-3">
              <textarea
                value={user.about || ""}
                maxLength={300}
                onChange={handleEdit}
                name="about"
                placeholder="Write something about yourself..."
                rows={4}
                className={`w-full bg-transparent text-lg outline-none resize-none transition-all duration-200 ${
                  editableFields.about
                    ? "border-b-2 border-blue-500 pb-1"
                    : "border-b border-transparent"
                }`}
                disabled={!editableFields.about}
              />
              <div className="flex justify-between items-center">
                <button
                  onClick={() =>
                    setEditableFields((prev) => ({
                      ...prev,
                      about: !editableFields.about,
                    }))
                  }
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors duration-200 self-start"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-500">
                  {user.about?.length || 0}/300
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
