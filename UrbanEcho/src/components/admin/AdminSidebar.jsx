import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

const AdminSidebar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <div className="w-64 bg-blue-800 text-white p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">Urban Echo</h1>

      <div className="flex items-center mb-6 p-2 bg-blue-700 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
          <i className="fas fa-user-shield"></i>
        </div>
        <div>
          <p className="font-medium">{user?.user_metadata?.name || 'Admin User'}</p>
          <p className="text-xs text-blue-200">Administrator</p>
        </div>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-2">
          <li>
            <a href="#dashboard" className="flex items-center p-2 rounded hover:bg-blue-700">
              <i className="fas fa-tachometer-alt w-6"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#issues" className="flex items-center p-2 rounded hover:bg-blue-700">
              <i className="fas fa-exclamation-circle w-6"></i>
              <span>Issues</span>
            </a>
          </li>
          <li>
            <a href="#users" className="flex items-center p-2 rounded hover:bg-blue-700">
              <i className="fas fa-users w-6"></i>
              <span>Users</span>
            </a>
          </li>
          <li>
            <a href="#analytics" className="flex items-center p-2 rounded hover:bg-blue-700">
              <i className="fas fa-chart-bar w-6"></i>
              <span>Analytics</span>
            </a>
          </li>
          <li>
            <a href="#settings" className="flex items-center p-2 rounded hover:bg-blue-700">
              <i className="fas fa-cog w-6"></i>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center p-2 rounded hover:bg-red-700"
      >
        <i className="fas fa-sign-out-alt w-6"></i>
        <span>Logout</span>
      </button>
    </div>
  );
};

export default AdminSidebar;