import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import StatusCards from '../components/admin/StatusCards';
import FilterSection from '../components/admin/FilterSection';
import IssuesTable from '../components/admin/IssuesTable';
import EditIssueModal from '../components/admin/EditIssueModal';
// import AddIssueModal from '../components/admin/AddIssueModal';

const Dashboard_admin = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    dateRange: 'all',
    sort: 'newest',
    search: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    filterAndSortIssues();
  }, [issues, filters]); // Add filters as a dependency

  useEffect(() => {
    const subscription = supabase
      .channel('resolution-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: 'type=eq.resolution_confirmation'
      }, (payload) => {
        checkResolutionStatus(payload.new.report_id);
      })
      .subscribe();
  
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Verify if user is an admin
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (!profileData || profileData.user_type !== 'authority') {
          navigate('/dashboard');
          return;
        }
        
        fetchIssues();
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      }
    };
  
    checkAuth();
  }, [navigate]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      
      // Fetch reports with upvotes count from report_upvotes table
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          upvotes:report_upvotes(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      // Process the data to get upvotes count
      const reportsWithUpvotes = data?.map(report => ({
        ...report,
        upvotes_count: report.upvotes[0]?.count || 0
      })) || [];

      setIssues(reportsWithUpvotes);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortIssues = () => {
    let filtered = [...issues];
    const { search, status, category, dateRange, sort } = filters;

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(report =>
        (report.title?.toLowerCase() || '').includes(searchTerm) ||
        (report.description?.toLowerCase() || '').includes(searchTerm) ||
        (report.location?.toLowerCase() || '').includes(searchTerm)
      );
    }

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(report => report.status === status);
    }

    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(report => report.category === category);
    }

    // Apply date filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date(now.setDate(now.getDate() - parseInt(dateRange)));
      filtered = filtered.filter(report => new Date(report.created_at) >= cutoffDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'most-upvotes':
          return (b.upvotes_count || 0) - (a.upvotes_count || 0);
        case 'least-upvotes':
          return (a.upvotes_count || 0) - (b.upvotes_count || 0);
        default:
          return 0;
      }
    });

    setFilteredIssues(filtered);
  };

  const handleIssueUpdate = async (reportId, updateData) => {
    try {
      if (updateData.status === 'resolved') {
        // Get all users who need to be notified (reporter and upvoters)
        const { data: report, error: reportError } = await supabase
          .from('reports')
          .select('created_by')
          .eq('id', reportId)
          .single();
  
        if (reportError) throw reportError;
  
        const { data: upvoters, error: upvotersError } = await supabase
          .from('report_upvotes')
          .select('user_id')
          .eq('report_id', reportId);
  
        if (upvotersError) throw upvotersError;
  
        // Create notifications for all users
        const usersToNotify = [
          report.created_by,
          ...upvoters.map(u => u.user_id)
        ];
  
        const notifications = usersToNotify.map(userId => ({
          report_id: reportId,
          user_id: userId,
          type: 'resolution_confirmation',
          message: 'Has this issue been resolved? Please confirm.',
          status: 'pending'
        }));
  
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);
  
        if (notificationError) throw notificationError;
  
        // Update report status to 'pending_resolution'
        const { error: updateError } = await supabase
          .from('reports')
          .update({ status: 'pending_resolution' })
          .eq('id', reportId);
  
        if (updateError) throw updateError;
      } else {
        // For other status updates
        const { error } = await supabase
          .from('reports')
          .update(updateData)
          .eq('id', reportId);
  
        if (error) throw error;
      }
  
      fetchIssues();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const checkResolutionStatus = async (reportId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('status')
        .eq('report_id', reportId)
        .eq('type', 'resolution_confirmation');
  
      if (error) throw error;
  
      // Check if all users have approved
      const allApproved = data.every(n => n.status === 'approved');
      const anyRejected = data.some(n => n.status === 'rejected');
  
      if (allApproved) {
        // Mark report as resolved
        const { error: updateError } = await supabase
          .from('reports')
          .update({ status: 'resolved' })
          .eq('id', reportId);
  
        if (updateError) throw updateError;
        
        fetchIssues();
      } else if (anyRejected) {
        // Revert to open status
        const { error: updateError } = await supabase
          .from('reports')
          .update({ status: 'open' })
          .eq('id', reportId);
  
        if (updateError) throw updateError;
        
        fetchIssues();
      }
    } catch (error) {
      console.error('Error checking resolution status:', error);
    }
  };

  const handleIssueAdd = async (newIssue) => {
    try {
      const { error } = await supabase
        .from('issues')
        .insert([{ ...newIssue, created_by: user.id }]);

      if (error) throw error;
      fetchIssues();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding issue:', error);
    }
  };

  const handleResolveIssue = async (reportId) => {
    try {
      // Get the reporter and upvoters
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .select('created_by')
        .eq('id', reportId)
        .single();
  
      if (reportError) throw reportError;
  
      const { data: upvoters, error: upvotersError } = await supabase
        .from('report_upvotes')
        .select('user_id')
        .eq('report_id', reportId);
  
      if (upvotersError) throw upvotersError;
  
      // Create notifications for all users
      const usersToNotify = [
        report.created_by,
        ...upvoters.map(u => u.user_id)
      ];
  
      // Insert notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(
          usersToNotify.map(userId => ({
            user_id: userId,
            message: `An administrator has marked report #${reportId} as resolved. Please confirm if the issue has been fixed.`
          }))
        );
  
      if (notificationError) throw notificationError;
  
      // Update report status to pending confirmation
      const { error: updateError } = await supabase
        .from('reports')
        .update({ status: 'pending_resolution' })
        .eq('id', reportId);
  
      if (updateError) throw updateError;
  
      // Refresh the issues list
      fetchIssues();
  
    } catch (error) {
      console.error('Error resolving issue:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {loading ? (
        <div className="w-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          <AdminSidebar user={user} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader 
              onAddClick={() => setShowAddModal(true)}
              onSearch={(term) => setFilters(prev => ({ ...prev, search: term }))}
              onRefresh={fetchIssues}
            />
            
            <main className="flex-1 overflow-y-auto p-6">
              <StatusCards issues={issues} />
              
              <FilterSection
                filters={filters}
                onChange={setFilters}
              />

              <IssuesTable
                issues={filteredIssues}
                loading={loading}
                onEdit={(issue) => {
                  setSelectedIssue(issue);
                  setShowEditModal(true);
                }}
                onResolve={handleResolveIssue}
              />
            </main>

            {showEditModal && (
              <EditIssueModal
                issue={selectedIssue}
                onClose={() => setShowEditModal(false)}
                onSave={handleIssueUpdate}
              />
            )}

            {showAddModal && (
              <AddIssueModal
                onClose={() => setShowAddModal(false)}
                onAdd={handleIssueAdd}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard_admin;