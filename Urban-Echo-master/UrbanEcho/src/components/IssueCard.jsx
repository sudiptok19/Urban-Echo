import React from 'react';

const IssueCard = ({ issue }) => {
  const {
    image,
    category,
    title,
    distance,
    description,
    reporter,
    reporterImage,
    timeAgo,
    upvotes
  } = issue;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden issue-card">
      <div className="relative">
        <img src={image} alt="Issue photo" className="w-full h-48 object-cover" />
        <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          {category}
        </span>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{title}</h3>
          <span className="text-xs text-gray-500">{distance}</span>
        </div>
        <p className="text-gray-600 mb-3 text-sm">{description}</p>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gray-300 mr-2 overflow-hidden">
              <img src={reporterImage} alt={reporter} className="w-full h-full object-cover" />
            </div>
            <span>{reporter}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-gray-500">{timeAgo}</span>
            <button className="upvote-button flex items-center text-gray-500 hover:text-blue-600">
              <i className="fas fa-chevron-up mr-1"></i>
              <span>{upvotes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;