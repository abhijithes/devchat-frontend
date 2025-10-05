import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Notifications,
  Settings,
} from "@mui/icons-material";
import { MenuIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../utils/token";
import { useQueryClient } from "@tanstack/react-query";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigation = useNavigate();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    setIsLoggedIn(getToken() ? true : false);
  });

  const handleLogout = () => {
    if (!confirm("Are you sure you want to logout?")) return;
    removeToken();
    setIsLoggedIn(false);
    navigation("/login");
    queryClient.invalidateQueries(["projects"]);
  };

  return (
    <nav className=" backdrop-blur-xs bg-gradient-to-tl from-black/5 to-white/10   border-zinc-200 rounded sticky top-0 left-full w-full md:w-max z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-5 justify-between items-center h-14">
          {/* Logo */}
          <Link to={"/"} className="text-xl font-bold text-zinc-900">
            DevChats.io
          </Link>
          {/* navigation */}
          {pathname.split("/").filter((p) => p).length > 1 && (
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
          )}
          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-6  items-center">
            <li>
              <Link
                to="#"
                title="Go to developer chats"
                className="text-gray-600 hover:text-zinc-900"
              >
                Dev chats
              </Link>
            </li>

            <li>
              <Link to="#" className="text-gray-600 hover:text-zinc-900">
                <Notifications />
              </Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 hover:text-zinc-900">
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
                    className="w-10 h-10 rounded-full border border-zinc-300 bg-white hover:bg-gray-100 text-center text-black grid place-items-center group "
                  >
                    M
                  </div>
                </Link>
                <div className="hidden group-hover:block absolute right-0  w-48 bg-white border border-gray-200 rounded shadow-lg z-40">
                  <li>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      Account
                    </Link>
                  </li>
                  <li
                    onClick={() => handleLogout()}
                    className="block px-4 py-2 text-red-500 hover:bg-gray-100"
                  >
                    Logout
                  </li>
                </div>
              </li>
            ) : (
              <div>
                <li>Login</li>
                <li>Register</li>
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

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden bg-white px-2 pt-2 pb-3 space-y-1 shadow">
          <li>
            <Link
              to="#"
              title="Go to developer chats"
              className="text-gray-600 hover:text-zinc-900"
            >
              Dev chats
            </Link>
          </li>

          <li>
            <Link to="#" className="text-gray-600 hover:text-zinc-900">
              Notifications <Notifications />
            </Link>
          </li>
          <li>
            <Link to="#" className="text-gray-600 hover:text-zinc-900">
              Settings <Settings />
            </Link>
          </li>
          <li>
            <Link
              to="#"
              className="text-gray-600 hover:text-zinc-900 flex gap-2"
            >
              Account
              <div
                title="profile page"
                className="w-10 h-10 rounded-full border border-zinc-300 bg-white hover:bg-gray-100 text-center text-black grid place-items-center "
              >
                M
              </div>
            </Link>
          </li>
          <li
            onClick={() => handleLogout()}
            className="block px-4 py-2 text-red-500 hover:bg-gray-100"
          >
            Logout
          </li>
        </ul>
      )}
    </nav>
  );
};

export default NavBar;
