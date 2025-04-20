import React from 'react';

const AdminHeader = ({ onAddClick, onSearch, onRefresh }) => {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Issue Management</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search issues..." 
              onChange={(e) => onSearch(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <i className="fas fa-sync-alt"></i>
          </button>

          <button
            onClick={onAddClick}
            className="bg-red-700 text-white px-5 py-2 rounded-md hover:bg-red-800"
          >
            Alert !
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;