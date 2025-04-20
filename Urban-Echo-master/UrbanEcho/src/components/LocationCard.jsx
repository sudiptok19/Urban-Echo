import React from 'react';

const LocationCard = ({ location, onUpdate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Your Location Details</h2>
        <button
          onClick={onUpdate}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Update Location
        </button>
      </div>

      {location ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <i className="fas fa-home text-blue-600 mt-1"></i>
            <div>
              <p className="text-sm font-medium text-gray-600">Address</p>
              <p className="text-gray-800">{location.houseNo}, {location.locality}</p>
              <p className="text-gray-800">{location.city}, {location.state}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <i className="fas fa-map-pin text-blue-600 mt-1"></i>
            <div>
              <p className="text-sm font-medium text-gray-600">PIN Code</p>
              <p className="text-gray-800">{location.pincode}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <i className="fas fa-phone-alt text-blue-600 mt-1"></i>
            <div>
              <p className="text-sm font-medium text-gray-600">Emergency Contacts</p>
              <div className="space-y-1">
                <p className="text-gray-800">Police: 100</p>
                <p className="text-gray-800">Fire: 101</p>
                <p className="text-gray-800">Ambulance: 102</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="fas fa-map-marker-alt text-4xl text-gray-400 mb-3"></i>
          <p className="text-gray-600">Please add your location details</p>
          <button
            onClick={onUpdate}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Add Location
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationCard;