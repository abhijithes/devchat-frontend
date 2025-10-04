import { useEffect, useRef } from "react";
import { current_url } from "../../constant/constant";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import avatar from "../../assets/avatar.jpg";
import { CircularProgress } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useLoader } from "../../contexts/GlobalLoaderContext";

interface UserType {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  about?: string;
}
export default function profile() {
  const [user, setUser] = useState<UserType | null>(null);
  const [userCopy, setUserCopy] = useState<UserType | null>(null);
  const [preview, setPreview] = useState<string | null>(avatar);
  const inputRef = useRef(null);
  const [pfploading, setpfpLoading] = useState(false);
  const [editablefields, setEditablefields] = useState({
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
        // Handle user data
      } catch (err) {
        console.log(err);
      } finally {
        hideLoader();
      }
    };

    fetchUserProfile();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Show preview immediately
      uploadProfilePicture(file); // Upload file
    }
  };

  const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    setpfpLoading(true);
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
    console.log({ url: pfpUrl.files[0].url });

    try {
      const res = await fetch(`${current_url}/users/Update/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ profilePicture: pfpUrl.files[0].url }),
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      const data = await res.json();
      setpfpLoading(false);
      if (res.ok) {
        setUser((prev) => ({ ...prev, profilePicture: data.profilePicture }));
      } else {
        console.error("Upload failed:", data.message);
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setpfpLoading(false);
    }
  };

  const handleedit = async (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
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
        setEditablefields({
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

  if (!user) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <p className="text-gray-500">Loading user profile...</p>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex justify-center items-center p-10">
      <div className="usercard w-260 h-200 bg-background rounded-lg p-6 flex flex-col items-center gap-10">
        <div className="profile w-full centered flex-col">
          <div className="pfp w-50 h-50 rounded-full border-4 border-gray-300 relative group overflow-hidden">
            <img
              src={`${user.profilePicture ? user.profilePicture : preview}`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
            <div className="w-full h-full absolute top-0 left-0 bg-gray-200 opacity-0 group-hover:opacity-80"></div>
            <button
              className="w-full h-full absolute top-0 left-0 hidden group-hover:block text-xl font-semibold font-family cursor-pointer"
              onClick={() => inputRef.current.click()}
            >
              Change profile picture
            </button>
            {/* hidden input */}
            <input
              type="file"
              className="hidden"
              ref={inputRef}
              onChange={(e) => handleFileChange(e)}
            />
            {pfploading && (
              <div className="z-10 w-full h-full absolute top-0 left-0 centered">
                <CircularProgress size={40} />
              </div>
            )}
          </div>

          <p className=" text-text font-family my-3 text-2xl font-semibold">
            {user.firstName}&nbsp;{user.lastName}
          </p>
        </div>
        <div className="editprofile flex flex-col gap-5 ">
          <div className="text-text firstname flex-left w-full">
            <p className="text-text w-50 ml-25 text-xl">First Name</p>
            <input
              type="text"
              maxLength={30}
              value={user.firstName}
              name="firstName"
              onChange={(e) => handleedit(e)}
              className={`text-text text-xl w-90 min-h-10 pl-2 ${
                editablefields.firstName
                  ? `border-2 border-black rounded-sm`
                  : ``
              }`}
              disabled={!editablefields.firstName}
            />
            <button
              onClick={() =>
                setEditablefields((prev) => ({
                  ...prev,
                  firstName: !editablefields.firstName,
                }))
              }
            >
              <Edit className="ml-2 text-text cursor-pointer" />
            </button>
          </div>
          <div className="text-text lastname flex-left w-full">
            <p className="text-text w-50 ml-25 text-xl">Last Name</p>
            <input
              type="text"
              maxLength={30}
              value={user.lastName}
              onChange={(e) => handleedit(e)}
              name="lastName"
              className={`text-text text-xl w-90 min-h-10 pl-2 ${
                editablefields.lastName
                  ? `border-2 border-black rounded-sm`
                  : ``
              }`}
              disabled={!editablefields.lastName}
            />
            <button
              onClick={() =>
                setEditablefields((prev) => ({
                  ...prev,
                  lastName: !editablefields.lastName,
                }))
              }
            >
              <Edit className="ml-2 text-text cursor-pointer" />
            </button>
          </div>
          <div className="text-text name flex-left w-full">
            <p className="text-text w-50 ml-25 text-xl">Email address</p>
            <input
              type="text"
              value={user.email}
              onChange={(e) => handleedit(e)}
              name="email"
              className={`text-text text-xl w-90 min-h-10 pl-2 ${
                editablefields.email ? `border-2 border-black rounded-sm` : ``
              }`}
              disabled={!editablefields.email}
            />
            <button
              onClick={() =>
                setEditablefields((prev) => ({
                  ...prev,
                  email: !editablefields.email,
                }))
              }
            >
              <Edit className="ml-2 text-text cursor-pointer" />
            </button>
          </div>
          <div className="text-text name top-left w-full">
            <p className="text-text w-50 ml-25 text-xl">About</p>
            <textarea
              value={user.about}
              maxLength={300}
              onChange={(e) => handleedit(e)}
              name="about"
              placeholder="write something about you.."
              className={`text-text text-xl w-90 h-30 pl-2 ${
                editablefields.about ? `border-2 border-black rounded-sm` : ``
              }`}
              disabled={!editablefields.about}
            />
            <button
              onClick={() =>
                setEditablefields((prev) => ({
                  ...prev,
                  about: !editablefields.about,
                }))
              }
            >
              <Edit className="ml-2 text-text cursor-pointer" />
            </button>
          </div>
        </div>
        <div
          className={`btns flex gap-5 ${user === userCopy ? `hidden` : `flex`}`}
        >
          <button
            className=" border-2 border-black px-4 md:px-6 py-3 rounded-lg text-black font-semibold"
            onClick={() => setUser(userCopy)}
          >
            Reset
          </button>
          <button
            className="bg-black px-4 md:px-6 py-3 rounded-lg text-white font-semibold"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
