import React, { useState } from 'react';

const IssuesTable = ({ issues, loading, onEdit, onResolve }) => {
  const [resolvingId, setResolvingId] = useState(null);

  console.log('IssuesTable received issues:', issues); // Debug log

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending_resolution':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="animate-pulse p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 mb-4 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const handleResolveClick = async (issueId) => {
    setResolvingId(issueId);
    try {
      await onResolve(issueId);
    } finally {
      setResolvingId(null);
    }
  };

  const renderActions = (issue) => (
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <button
        onClick={() => onEdit(issue)}
        className="text-blue-600 hover:text-blue-900 mr-3"
      >
        <i className="fas fa-pencil-alt mr-1"></i>
        Edit
      </button>
      {issue.status !== 'resolved' && (
        <button
          onClick={() => handleResolveClick(issue.id)}
          disabled={resolvingId === issue.id}
          className={`text-green-600 hover:text-green-900 ${
            resolvingId === issue.id ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <i className={`fas ${resolvingId === issue.id ? 'fa-spinner fa-spin' : 'fa-check-circle'} mr-1`}></i>
          {resolvingId === issue.id ? 'Sending...' : 'Resolve'}
        </button>
      )}
    </td>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upvotes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created On</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.isArray(issues) && issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{issue.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{issue.title || 'No Title'}</div>
                  <div className="text-sm text-gray-500">{issue.category || 'Uncategorized'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-2">
                    {issue.description || 'No description'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{issue.location || 'No location'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900 font-medium">{issue.upvotes_count}</span>
                    <svg 
                      className="h-4 w-4 ml-1 text-blue-500" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(issue.status)}`}>
                    {issue.status || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {issue.picture_url && (
                    <img 
                      src={issue.picture_url} 
                      alt="Report"
                      className="h-10 w-10 rounded-md object-cover cursor-pointer hover:opacity-75"
                      onClick={() => window.open(issue.picture_url, '_blank')}
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : 'Unknown date'}
                </td>
                {renderActions(issue)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(!issues || issues.length === 0) && !loading && (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-inbox text-4xl mb-4"></i>
          <p>No reports found</p>
        </div>
      )}
    </div>
  );
};

export default IssuesTable;