import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";

function Navbar() {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = ""; // Redirect to login page
  };

  return (
    <nav className="bg-gray-900 text-white p-4 w-full flex justify-between items-center shadow-lg">
      {/* Left - Logo */}
      <h1 className="text-xl font-bold text-blue-400">SubManager</h1>

      {/* Center - Navigation Links */}
      <ul className="flex gap-6">
        <li>
          <Link
            to="/"
            className={`${
              location.pathname === "/" ? "text-blue-400" : "text-gray-300"
            } hover:text-blue-400`}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/subscriptions"
            className={`${
              location.pathname === "/subscriptions" ? "text-blue-400" : "text-gray-300"
            } hover:text-blue-400`}
          >
            Subscriptions
          </Link>
        </li>
                <li>
          <Link
            to="/chat"
            className={`${
              location.pathname === "/chat" ? "text-blue-400" : "text-gray-300"
            } hover:text-blue-400`}
          >
            Chat
          </Link>
        </li>
      </ul>

        {/* 🔽 Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaUser className="text-lg" />
            Account
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden animate-fadeIn">
              <ul className="text-gray-900 dark:text-white">
                <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => navigate("/profile")}
                >
                  <FaUser /> Profile
                </li>
                <li
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={() => navigate("/settings")}
                >
                  <FaCog /> Settings
                </li>
                <li
                  className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
    </nav>
  );
}

export default Navbar;
