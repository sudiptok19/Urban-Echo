import React from 'react';

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"> </link>

const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Reports</p>
            <p className="text-2xl font-bold">1,248</p>
          </div>
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
            <i className="fas fa-flag"></i>
          </div>
        </div>
      </div>
      {/* Add other stats cards similarly */}
    </div>
  );
};

export default StatsCards;