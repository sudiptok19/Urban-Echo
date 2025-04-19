import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../config/supabaseClient'
import Sidebar from '../components/Sidebar'
import ReportModal from '../components/ReportModal'
import IssueCard from '../components/IssueCard'
import LocationModal from '../components/LocationModal'
import ReportIssueDialog from '../components/ReportIssueDialog'

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

  useEffect(() => {
    let mounted = true;

    const fetchAllData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch user reports
        const { data: userReportsData, error: userReportsError } = await supabase
          .from('reports')
          .select(`
            *,
            profiles:user_id (
              name,
              email
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (userReportsError) throw userReportsError;
        if (mounted) setUserReports(userReportsData || []);

        // Fetch all community reports
        const { data: allReportsData, error: allReportsError } = await supabase
          .from('reports')
          .select(`
            *,
            profiles:user_id (
              name,
              email
            )
          `)
          .order('created_at', { ascending: false });

        if (allReportsError) throw allReportsError;
        if (mounted) setIssues(allReportsData || []);

        // Fetch upvotes
        await fetchUpvotes();
        
        // Check user location
        await checkUserLocation();

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAllData();

    // Cleanup function
    return () => {
      mounted = false;
    };
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
        const fileName = `${Date.now()}_${formData.picture.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('report-pictures')
          .upload(fileName, formData.picture);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('report-pictures')
          .getPublicUrl(fileName);
        
        pictureUrl = publicUrl;
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

      // Update both lists
      setUserReports(prevReports => [data[0], ...prevReports]);
      setIssues(prevIssues => [data[0], ...prevIssues]);

      alert('Report submitted successfully!');
      setShowReportDialog(false);
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

  const ReportCard = ({ report }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            report.status === 'done' 
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {report.status === 'done' ? 'Done' : 'Pending'}
          </span>
          <button
            onClick={() => handleUpvote(report.id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${
              userUpvotes[report.id]
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <i className={`fas fa-arrow-up ${userUpvotes[report.id] ? 'text-blue-600' : ''}`}></i>
            <span>{upvotes[report.id] || 0}</span>
          </button>
        </div>
        {report.user_id === user.id && (
          <button
            onClick={() => handleDeleteReport(report.id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete report"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        )}
      </div>

      {report.picture_url && (
        <div className="relative w-full h-48 mb-4">
          <img
            src={report.picture_url}
            alt={report.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      )}

      <h3 className="font-semibold text-gray-800 text-lg mb-2">{report.title}</h3>
      <p className="text-gray-600 mb-4">{report.description}</p>
      <p className="text-gray-600 mb-2">{report.location}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <i className="far fa-clock mr-2"></i>
          {new Date(report.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center">
          <i className="far fa-user mr-2"></i>
          <span>{report.profiles?.name || 'Anonymous'}</span>
        </div>
      </div>
    </div>
  );

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
              {/* User Reports Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">My Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userReports.map((report) => (
                    <ReportCard key={report.id} report={report} />
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

              {/* All Reports Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Community Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {issues.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                  {issues.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                      <i className="fas fa-file-alt text-gray-400 text-4xl mb-4"></i>
                      <p className="text-gray-500">No reports submitted yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Issues Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Community Issues</h2>
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