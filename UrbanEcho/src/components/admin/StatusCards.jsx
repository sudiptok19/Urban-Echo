import React from 'react';

const StatusCards = ({ issues }) => {
  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <i className="fas fa-clipboard-list text-blue-600"></i>
          </div>
          <div className="ml-4">
            <h3 className="text-gray-500 text-sm">Total Issues</h3>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 rounded-full">
            <i className="fas fa-exclamation-circle text-yellow-600"></i>
          </div>
          <div className="ml-4">
            <h3 className="text-gray-500 text-sm">Open</h3>
            <p className="text-2xl font-semibold">{stats.open}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-full">
            <i className="fas fa-clock text-purple-600"></i>
          </div>
          <div className="ml-4">
            <h3 className="text-gray-500 text-sm">In Progress</h3>
            <p className="text-2xl font-semibold">{stats.inProgress}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-full">
            <i className="fas fa-check-circle text-green-600"></i>
          </div>
          <div className="ml-4">
            <h3 className="text-gray-500 text-sm">Resolved</h3>
            <p className="text-2xl font-semibold">{stats.resolved}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCards;