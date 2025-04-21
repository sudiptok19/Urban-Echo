import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../config/supabaseClient'
import Sidebar from '../components/Sidebar'
import ReportModal from '../components/ReportModal'
import IssueCard from '../components/IssueCard'
import LocationModal from '../components/LocationModal'
import ReportIssueDialog from '../components/ReportIssueDialog'
import { useNavigate } from 'react-router-dom';

const Header = () => (
  <header className="bg-white shadow-sm p-4">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
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

const calculateDistance = (location1, location2) => {
  // Simple placeholder - replace with actual distance calculation if needed
  return 'N/A';
};

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [userReports, setUserReports] = useState([]);
  const [upvotes, setUpvotes] = useState({});
  const [userUpvotes, setUserUpvotes] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  // Update the fetchReports function
  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Modified query to remove the profiles join
      const { data: reports, error } = await supabase
        .from('reports')
        .select(`
          *,
          report_upvotes (
            id,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (reports) {
        console.log('All reports:', reports);
        
        // Set all reports for community section
        setIssues(reports);
        
        // Filter user's reports
        const userReportsFiltered = reports.filter(report => report.user_id === user.id);
        setUserReports(userReportsFiltered);
        
        // Calculate upvotes
        const upvoteCounts = {};
        const userVotes = {};
        
        reports.forEach(report => {
          upvoteCounts[report.id] = report.report_upvotes?.length || 0;
          userVotes[report.id] = report.report_upvotes?.some(
            upvote => upvote.user_id === user.id
          ) || false;
        });

        setUpvotes(upvoteCounts);
        setUserUpvotes(userVotes);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch reports on mount and location change

  useEffect(() => {
    if (user) {
      fetchReports();
      checkUserLocation();
    }
  }, [user]);

  const checkUserLocation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_locations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setShowLocationModal(true);
        } else {
          throw error;
        }
      }

      if (data) {
        setUserLocation(data);
      }
    } catch (error) {
      console.error('Error checking location:', error);
      setShowLocationModal(true);
    }
  };

  const fetchUpvotes = async () => {
    try {
      // Fetch all upvotes
      const { data: upvoteData, error: upvoteError } = await supabase
        .from('report_upvotes')
        .select('report_id');

      if (upvoteError) throw upvoteError;

      // Count upvotes for each report
      const upvoteCounts = upvoteData.reduce((acc, curr) => {
        acc[curr.report_id] = (acc[curr.report_id] || 0) + 1;
        return acc;
      }, {});

      // Fetch user's upvotes
      const { data: userUpvoteData, error: userUpvoteError } = await supabase
        .from('report_upvotes')
        .select('report_id')
        .eq('user_id', user.id);

      if (userUpvoteError) throw userUpvoteError;

      // Create map of user's upvotes
      const userUpvoteMap = userUpvoteData.reduce((acc, curr) => {
        acc[curr.report_id] = true;
        return acc;
      }, {});

      setUpvotes(upvoteCounts);
      setUserUpvotes(userUpvoteMap);
    } catch (error) {
      console.error('Error fetching upvotes:', error);
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

  const handleReportSubmit = async (formData) => {
    try {
      let pictureUrl = null;
      
      if (formData.picture) {
        // Create a unique filename with timestamp and random number
        const timestamp = Date.now();
        const random = Math.random();
        const fileName = `${timestamp}_${random}${path.extname(formData.picture.name)}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-pictures')
          .upload(fileName, formData.picture, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Construct the public URL in the correct format
        pictureUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/report-pictures/${fileName}`;
        
        // Alternative way to get the URL using Supabase client
        // const { data: { publicUrl } } = supabase.storage
        //   .from('report-pictures')
        //   .getPublicUrl(fileName);
        // pictureUrl = publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          location: formData.location,
          picture_url: pictureUrl,
          status: 'pending'
        })
        .select();

      if (insertError) throw insertError;

      // Update both lists and refresh data
      await fetchReports();
      setShowReportDialog(false);
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const { error } = await supabase
          .from('reports')
          .delete()
          .eq('id', reportId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update both lists
        setUserReports(prevReports => 
          prevReports.filter(report => report.id !== reportId)
        );
        setIssues(prevIssues =>
          prevIssues.filter(report => report.id !== reportId)
        );
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report. Please try again.');
      }
    }
  };

  const handleUpvote = async (reportId) => {
    try {
      if (userUpvotes[reportId]) {
        // Remove upvote
        const { error } = await supabase
          .from('report_upvotes')
          .delete()
          .eq('report_id', reportId)
          .eq('user_id', user.id);

        if (error) throw error;

        setUpvotes(prev => ({
          ...prev,
          [reportId]: (prev[reportId] || 1) - 1
        }));
        setUserUpvotes(prev => ({
          ...prev,
          [reportId]: false
        }));
      } else {
        // Add upvote
        const { error } = await supabase
          .from('report_upvotes')
          .insert({
            report_id: reportId,
            user_id: user.id
          });

        if (error) throw error;

        setUpvotes(prev => ({
          ...prev,
          [reportId]: (prev[reportId] || 0) + 1
        }));
        setUserUpvotes(prev => ({
          ...prev,
          [reportId]: true
        }));
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      alert('Failed to update upvote. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} userLocation={userLocation} />
      
      <div className="flex-1 overflow-auto">
        <Header />
        
        <main className="p-6">
          <StatsCards />
          
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
              {/* User Reports Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">My Reports</h2>
                  {/* <button
                    onClick={() => setShowReportDialog(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    New Report
                  </button> */}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userReports.map((report) => (
                    <IssueCard 
                      key={report.id}
                      issue={{
                        ...report,
                        reporter: 'Anonymous', // Simplified since we don't have profiles
                        reporterImage: '/default-avatar.jpg', // Use default avatar
                        timeAgo: new Date(report.created_at).toLocaleDateString(),
                        upvotes: upvotes[report.id] || 0,
                        distance: userLocation ? `${calculateDistance(userLocation, report.location)} km` : 'Unknown'
                      }}
                      onUpvote={handleUpvote}
                    />
                  ))}
                  {userReports.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                      <i className="fas fa-file-alt text-gray-400 text-4xl mb-4"></i>
                      <p className="text-gray-500">No reports submitted yet.</p>
                      <button
                        onClick={() => setShowReportDialog(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Submit Your First Report
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Community Reports Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Community Reports</h2>
                <FiltersSection />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {issues.map((report) => (
                    <IssueCard 
                      key={report.id}
                      issue={{
                        ...report,
                        reporter: 'Anonymous', // Simplified since we don't have profiles
                        reporterImage: '/default-avatar.jpg', // Use default avatar
                        timeAgo: new Date(report.created_at).toLocaleDateString(),
                        upvotes: upvotes[report.id] || 0,
                        distance: userLocation ? `${calculateDistance(userLocation, report.location)} km` : 'Unknown'
                      }}
                      onUpvote={handleUpvote}
                    />
                  ))}
                  {issues.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                      <i className="fas fa-file-alt text-gray-400 text-4xl mb-4"></i>
                      <p className="text-gray-500">No reports submitted yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <button
        onClick={() => setShowReportDialog(true)}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        <i className="fas fa-plus mr-2"></i>
        Report Issue
      </button>

      <ReportIssueDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
};

export default Dashboard