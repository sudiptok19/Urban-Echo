import React from 'react';

const IssueCard = ({ issue, onUpvote }) => {
  const {
    picture_url,  // Changed from image to match Supabase column
    category,
    title,
    distance,
    description,
    reporter,
    reporterImage,
    timeAgo,
    upvotes,
    status,
    created_at
  } = issue;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden issue-card">
      {picture_url && (
        <div className="relative">
          <img 
            src={picture_url} 
            alt="Issue photo" 
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.error('Image load error for:', picture_url);
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {category}
            </span>
            {status && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                status === 'resolved' 
                  ? 'bg-green-100 text-green-800'
                  : status === 'in-progress'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{title}</h3>
          <span className="text-xs text-gray-500">{distance}</span>
        </div>
        <p className="text-gray-600 mb-3 text-sm">{description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-300 mr-2 overflow-hidden">
              <img 
                src={reporterImage || '/default-avatar.jpg'}
                alt={reporter || 'Anonymous'} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.jpg'; // Add a fallback avatar
                }}
              />
            </div>
            <span>{reporter || 'Anonymous'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-500">{timeAgo || formatDate(created_at)}</span>
            <button 
              onClick={() => onUpvote && onUpvote(issue.id)}
              className="upvote-button flex items-center text-gray-500 hover:text-blue-600"
            >
              <i className="fas fa-chevron-up mr-1"></i>
              <span>{upvotes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;