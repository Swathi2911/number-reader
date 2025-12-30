import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully 👋");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-indigo-200 shadow-md">
      {/* Logo */}
      <h1 className="text-xl font-bold text-indigo-600">
        NumberApp
      </h1>

      {/* Menu */}
      <ul className="hidden gap-6 font-medium text-gray-700 md:flex">
        <li>
          <Link to="/" className="hover:text-indigo-600">
            Home
          </Link>
        </li>

        <li>
          <Link to="/contact" className="hover:text-indigo-600">
            Contact Us
          </Link>
        </li>

        {isLoggedIn && (
          <>
          

            <li>
              <Link to="/profile" className="hover:text-indigo-600">
                Profile
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* Auth buttons */}
      <div className="flex gap-3">
        {!isLoggedIn ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
