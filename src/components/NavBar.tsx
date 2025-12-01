import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Notifications,
  NotificationsActive,
  Settings,
} from "@mui/icons-material";
import { MenuIcon, XIcon } from "lucide-react";
import { ListAlt } from '@mui/icons-material';

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken, getUserPublicInfo, removeToken } from "../utils/token";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackBar } from "./snack-bar/snack-bar-context";
import NotificationBox from "./notification-box/NotificationBox";
import { useSocket } from "../contexts/SocketBaseContext";

interface UserInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
}

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: "",
    firstName: "",
    profilePicture: "",
  });

  const notificationBoxRef = useRef<HTMLDivElement>(null);
  const [openNotifiaction, setOpenNotification] = useState(false);
  const { notifications } = useSocket();

  const navigation = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackBar } = useSnackBar();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    setUserInfo(
      getUserPublicInfo() || {
        email: "",
        firstName: "",
        profilePicture: "",
      }
    );
    triggerWelcomeToast();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationBoxRef.current &&
        !notificationBoxRef.current.contains(event.target as Node)
      ) {
        setOpenNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationBoxRef]);

  const triggerWelcomeToast = () => {
    if (!sessionStorage.getItem("DEV_CHATX_OPENED_NOS")) {
      sessionStorage.setItem("DEV_CHATX_OPENED_NOS", "true");
      showSnackBar("Welcome to DevChats.io", "success", 3000);
    }
  };

  const handleLogout = () => {
    if (!confirm("Are you sure you want to logout?")) return;
    removeToken();
    setIsLoggedIn(false);
    navigation("/login");
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  return (
    <nav className="backdrop-blur-xs bg-linear-to-tl from-black/5 to-white/10 border-zinc-200 rounded sticky top-0 md:fixed md:top-5 md:right-8 w-full md:w-max z-[45]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-5 justify-between items-center h-14">
          {/* Logo */}
          <Link to={"/"} className="text-xl font-bold text-zinc-900">
            DevChats.io
          </Link>

          {/* navigation arrows */}
          <div className="flex items-center gap-4">
            <KeyboardArrowLeft
              onClick={() => navigation(-1)}
              className="h-6 w-6 text-gray-600 cursor-pointer"
            />
            <KeyboardArrowRight
              onClick={() => navigation(1)}
              className="h-6 w-6 text-gray-600 cursor-pointer"
            />
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-6 items-center">
            <li>
              <Link
                to="/chat"
                title="Go to developer chats"
                className="text-gray-600 hover:text-zinc-900"
              >
                Dev chats
              </Link>
            </li>
            <li>
              <Link
                to="/listTodos"
                className="text-gray-600 hover:text-zinc-900"
              >
               <ListAlt />
              </Link>
            </li>

            <li onClick={() => setOpenNotification((pre) => !pre)}>
              <button className="text-gray-600 hover:text-zinc-900 relative">
                {notifications.some((item) => !item.read) ? (
                  <NotificationsActive
                    htmlColor="green"
                    className="notification-active"
                  />
                ) : (
                  <Notifications />
                )}
                <NotificationBox
                  ref={notificationBoxRef}
                  opened={openNotifiaction}
                  closeNotificationBox={() => setOpenNotification(false)}
                  style="backrop-blur-2xl"
                />
              </button>
            </li>

            <li>
              <Link
                to="/settings"
                className="text-gray-600 hover:text-zinc-900"
              >
                <Settings />
              </Link>
            </li>

            {isLoggedIn ? (
              <li className="relative group">
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-zinc-900"
                >
                  <div
                    title="profile page"
                    className="w-10 h-10 rounded-full border border-zinc-300 bg-white hover:bg-gray-100 text-center text-black grid place-items-center group"
                  >
                    {userInfo.profilePicture ? (
                      <img
                        src={userInfo.profilePicture}
                        alt={userInfo.firstName}
                        className="w-full h-full object-cover rounded-full aspect-square"
                      />
                    ) : (
                      userInfo.firstName.charAt(0).toUpperCase() || "L"
                    )}
                  </div>
                </Link>
                <div className="hidden group-hover:block absolute right-0 w-48 bg-white border border-gray-200 rounded shadow-lg z-40">
                  <ul>
                    <li>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
                      >
                        Account
                      </Link>
                    </li>
                    <li
                      onClick={handleLogout}
                      className="block px-4 py-2 text-red-500 hover:bg-gray-100"
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              </li>
            ) : (
              <div className="flex gap-4">
                <li>
                  <Link to={"/login"}> Login </Link>
                </li>
              </div>
            )}
          </ul>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none"
            >
              {isOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Menu with full functionality */}
      {isOpen && (
        <ul className="md:hidden bg-white px-2 pt-2 pb-3 space-y-2 shadow">
          <li>
            <Link
              to="/chat"
              title="Go to developer chats"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              Dev Chats
            </Link>
          </li>

          {/* Notifications */}
          <li className="relative">
            <button
              onClick={() => setOpenNotification((p) => !p)}
              className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              {notifications.some((item) => !item.read) ? (
                <NotificationsActive htmlColor="green" />
              ) : (
                <Notifications />
              )}
              Notifications
            </button>
            {openNotifiaction && (
              <div ref={notificationBoxRef}>
                <NotificationBox
                  opened={openNotifiaction}
                  closeNotificationBox={() => setOpenNotification(false)}
                  style="bg-white border "
                />
              </div>
            )}
          </li>

          {/* Settings */}
          <li>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              <Settings /> Settings
            </Link>
          </li>

          {/* Profile & Auth */}
          {isLoggedIn ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  <div
                    title="profile"
                    className="w-10 h-10 rounded-full border border-zinc-300 bg-white grid place-items-center"
                  >
                    {userInfo.profilePicture ? (
                      <img
                        src={userInfo.profilePicture}
                        alt={userInfo.firstName}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      userInfo.firstName.charAt(0).toUpperCase() || "L"
                    )}
                  </div>
                  {userInfo.firstName || "My Account"}
                </Link>
              </li>

              <li
                onClick={handleLogout}
                className="px-4 py-2 text-red-500 hover:bg-gray-100 rounded cursor-pointer"
              >
                Logout
              </li>
            </>
          ) : (
            <li>
              <Link
                to="/login"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
};

export default NavBar;
