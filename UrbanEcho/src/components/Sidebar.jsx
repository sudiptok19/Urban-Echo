import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import LocationModal from './LocationModal';
import { useAuth } from '../contexts/AuthContext';

const navigationItems = [
  { path: '/', icon: 'fas fa-home', label: 'Home' },
  { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
  { path: '/resolved', icon: 'fas fa-check-circle', label: 'Resolved Issues' }
];

const Sidebar = ({ user, isAuthority = false, onLocationUpdate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const [imageError, setImageError] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchUserLocation();
  }, [user]);

  const fetchUserLocation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // <-- use maybeSingle instead of single

      if (error) throw error;
      setUserLocation(data);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login'); // or navigate('/') if you want
      // Optionally: window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <div id="sidebar" className="w-64 bg-blue-800 text-white p-4 transform -translate-x-full md:translate-x-0 fixed md:relative inset-y-0 z-40 transition-transform duration-300">
      {/* Profile Section */}
      <div className="flex flex-col space-y-6">
        {/* App Logo */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Urban Echo</h1>
          <button id="close-sidebar" className="md:hidden text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-3 bg-blue-700 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              {imageError || !user?.user_metadata?.avatar_url ? (
                <i className="fas fa-user text-xl"></i>
              ) : (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={userName}
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <div>
              <p className="font-medium text-lg">{userName}</p>
              <p className="text-sm text-blue-200">{isAuthority ? 'Authority' : 'Citizen'}</p>
            </div>
          </div>
        </div>

        {/* Location Preview */}
        {userLocation && (
          <div className="p-3 bg-blue-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-200">
                <i className="fas fa-map-marker-alt mr-2"></i>
                {userLocation.city}
              </span>
              <button
                onClick={() => setShowLocationModal(true)}
                className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-500"
              >
                Update
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-8">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`px-4 py-2 rounded flex items-center ${
                  location.pathname === item.path ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                <i className={`${item.icon} mr-3`}></i> {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {isAuthority && (
        <div className="mt-8">
          <h3 className="text-xs uppercase tracking-wider mb-2 text-blue-300">Authority Tools</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/priority-queue" className="px-4 py-2 hover:bg-blue-700 rounded flex items-center">
                <i className="fas fa-tasks mr-3"></i> Priority Queue
              </Link>
            </li>
            <li>
              <Link to="/mark-resolved" className="px-4 py-2 hover:bg-blue-700 rounded flex items-center">
                <i className="fas fa-check-double mr-3"></i> Mark as Resolved
              </Link>
            </li>
          </ul>
        </div>
      )}

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        user={user}
        onLocationUpdate={(location) => {
          setUserLocation(location);
          onLocationUpdate?.(location);
        }}
      />

      {/* Updated Logout Button */}
      <div className="absolute bottom-4 w-full px-4">
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center p-2 rounded hover:bg-red-700 "
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;