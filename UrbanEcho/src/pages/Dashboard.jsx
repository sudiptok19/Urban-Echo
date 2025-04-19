import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../config/supabaseClient'
import Sidebar from '../components/Sidebar'
import ReportModal from '../components/ReportModal'
import IssueCard from '../components/IssueCard'
import LocationModal from '../components/LocationModal'

const Header = ({ onReportClick }) => (
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
  const [issues, setIssues] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkUserLocation();
    }
  }, [user]);

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

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} userLocation={userLocation} />
      
      <div className="flex-1 overflow-auto">
        <Header />
        
        <main className="p-6">
          {showLocationModal ? (
            <LocationModal
              isOpen={true}
              onClose={() => {}}
              user={user}
              required={true}
              onLocationUpdate={handleLocationUpdate}
            />
          ) : loading ? (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <FiltersSection />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map(issue => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue}
                    userLocation={userLocation}
                  />
                ))}
                {issues.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No issues reported in your area yet.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard