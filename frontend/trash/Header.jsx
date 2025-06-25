import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";

function Header() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const dropdownRef = useRef(null);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = ""; // Redirect to login page
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-900 dark:bg-gray-800 shadow-md relative">
      <h1 className="text-3xl font-bold text-white">Subscription Tracker</h1>

      <div className="flex items-center gap-4">
        {/* 🌙 Dark Mode Toggle */}
        {/* <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-gray-700 dark:bg-gray-600 text-white rounded-md"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button> */}

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
      </div>
    </div>
  );
}

export default Header;
