import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';
import Sidebar from '../components/Sidebar';
import ReportModal from '../components/ReportModal';
import IssueCard from '../components/IssueCard';
import LocationModal from '../components/LocationModal';
import NotificationBell from '../components/NotificationBell';
import NotificationModal from '../components/NotificationModal';

const Header = ({ onReportClick, notifications, onNotificationClick }) => (
  <header className="bg-white shadow-sm p-4">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search issues..." 
            className="w-64 pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
        </div>
        <NotificationBell 
          notifications={notifications}
          onClick={onNotificationClick}
        />
        {/* Report Issue Button */}
        <button
          onClick={onReportClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Report Issue
        </button>
      </div>
    </div>
  </header>
)

const FiltersSection = () => (
  <div className="mb-6">
    <div className="flex gap-4">
      <select className="border p-2 rounded">
        <option>All Categories</option>
        <option>Infrastructure</option>
        <option>Public Safety</option>
        <option>Environment</option>
      </select>
      <select className="border p-2 rounded">
        <option>All Status</option>
        <option>Open</option>
        <option>In Progress</option>
        <option>Resolved</option>
      </select>
    </div>
  </div>
)

const StatsCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700">Total Issues</h3>
      <p className="text-3xl font-bold text-blue-600">24</p>
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
      <p className="text-3xl font-bold text-yellow-600">8</p>
    </div>
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
      <p className="text-3xl font-bold text-green-600">12</p>
    </div>
  </div>
)

const Pagination = () => (
  <div className="mt-6 flex justify-center">
    <nav className="flex gap-2">
      <button className="px-3 py-1 border rounded">Previous</button>
      <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
      <button className="px-3 py-1 border rounded">2</button>
      <button className="px-3 py-1 border rounded">3</button>
      <button className="px-3 py-1 border rounded">Next</button>
    </nav>
  </div>
)

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showReportModal, setShowReportModal] = useState(false);
  const [issues, setIssues] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }

        // Verify user is not an admin
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single();

        if (profileData?.user_type === 'authority') {
          console.log('Admin user detected, redirecting to admin dashboard');
          navigate('/admin', { replace: true });
          return;
        }

        // Load dashboard data
        await Promise.all([
          fetchIssues(),
          checkUserLocation(),
          fetchNotifications()
        ]);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          user:users(name),
          upvotes:report_upvotes(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No data found
          setShowLocationModal(true);
        } else {
          throw error;
        }
      }

      if (data) {
        setUserLocation(data);
        await fetchLocationBasedFeed(data.pincode);
      }
    } catch (error) {
      console.error('Error checking location:', error);
      setShowLocationModal(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationBasedFeed = async (pincode) => {
    try {
      setLoading(true);
      
      // Fetch issues from the same pincode or nearby areas
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          user_locations (city, state),
          profiles (name)
        `)
        .eq('pincode', pincode)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async (locationData) => {
    try {
      setLoading(true);
      setUserLocation(locationData);
      setShowLocationModal(false);
      
      // Fetch issues for the new location
      const { data: issues, error } = await supabase
        .from('issues')
        .select('*')
        .eq('pincode', locationData.pincode)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(issues || []);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} userLocation={userLocation} />
      
      <div className="flex-1 overflow-auto">
        <Header 
          onReportClick={() => setShowReportModal(true)}
          notifications={notifications}
          onNotificationClick={() => setShowNotificationModal(true)}
        />
        
        <main className="p-6">
          <StatsCards />
          <FiltersSection />
          
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map(issue => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue}
                    userLocation={userLocation}
                  />
                ))}
              </div>
              {issues.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No issues reported in your area yet.</p>
                </div>
              )}
              <Pagination />
            </>
          )}
        </main>

        {showReportModal && (
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            onSubmit={async (data) => {
              await fetchIssues();
              setShowReportModal(false);
            }}
            userLocation={userLocation}
          />
        )}

        {showLocationModal && (
          <LocationModal
            isOpen={showLocationModal}
            onClose={() => setShowLocationModal(false)}
            user={user}
            onLocationUpdate={handleLocationUpdate}
          />
        )}

        {showNotificationModal && (
          <NotificationModal
            isOpen={showNotificationModal}
            onClose={() => setShowNotificationModal(false)}
            notification={selectedNotification}
            onConfirm={async (response) => {
              await fetchNotifications();
              setShowNotificationModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;