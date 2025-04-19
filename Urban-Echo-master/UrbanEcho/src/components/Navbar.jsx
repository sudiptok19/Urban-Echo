import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation Links */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-white">
                Urban Echo
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:border-white"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:border-white"
              >
                Dashboard
              </Link>
              <Link
                to="/about-us"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:border-white"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-white hover:border-white"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right side - Auth Buttons */}
          <div className="flex items-center">
            {!user ? (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-white">
                  Welcome, {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-white block pl-3 pr-4 py-2 border-l-4 border-transparent hover:bg-blue-700"
            >
              Home
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="text-white block pl-3 pr-4 py-2 border-l-4 border-transparent hover:bg-blue-700"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/about-us"
              className="text-white block pl-3 pr-4 py-2 border-l-4 border-transparent hover:bg-blue-700"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-white block pl-3 pr-4 py-2 border-l-4 border-transparent hover:bg-blue-700"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
