import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient'; // Add this import

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
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
              <Link 
                to="/" 
                className="flex items-center cursor-pointer"
                onClick={() => navigate('/')}
              >
                <img 
                  src="/logo.png" 
                  alt="Urban Echo Logo" 
                  className="h-8 w-8 mr-2 rounded-full"
                />
                <span className="text-2xl font-bold text-white hover:text-gray-100 transition-colors">
                  Urban Echo
                </span>
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
                  to="/signup"
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
                  disabled={isLoggingOut}
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
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
