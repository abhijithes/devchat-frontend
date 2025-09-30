import { MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className=" backdrop-blur-xs bg-white/20  border border-zinc-200 rounded sticky top-0 left-0 w-full z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={"/"} className="text-xl font-bold text-zinc-900">
            DevChats.io
          </Link>
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
                Dev chats
              </Link>
            </li>
            <li>
              <Link to="#" className="text-gray-600 hover:text-zinc-900">
                <div
                  title="profile page"
                  className="w-10 h-10 rounded-full border border-zinc-300 bg-white hover:bg-gray-100 text-center text-black grid place-items-center "
                >
                  M
                </div>
              </Link>
            </li>
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
        <div className="md:hidden bg-white px-2 pt-2 pb-3 space-y-1 shadow">
          <a
            href="#"
            className="block text-gray-700 px-3 py-2 rounded hover:bg-gray-100"
          >
            Home
          </a>
          <a
            href="#"
            className="block text-gray-700 px-3 py-2 rounded hover:bg-gray-100"
          >
            About
          </a>
          <a
            href="#"
            className="block text-gray-700 px-3 py-2 rounded hover:bg-gray-100"
          >
            Services
          </a>
          <a
            href="#"
            className="block text-gray-700 px-3 py-2 rounded hover:bg-gray-100"
          >
            Contact
          </a>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
