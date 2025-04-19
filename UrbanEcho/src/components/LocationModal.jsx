import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const LocationModal = ({ isOpen, onClose, user, onLocationUpdate, required = false, initialData = null }) => {
  const [formData, setFormData] = useState({
    houseNo: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate pincode
      if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
        throw new Error('Invalid pincode format');
      }

      // Format the data for the user_locations table
      const locationData = {
        user_id: user.id,
        house_no: formData.houseNo,
        locality: formData.locality,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        updated_at: new Date().toISOString()
      };

      const { data, error: locationError } = await supabase
        .from('user_locations')
        .upsert(locationData)
        .select()
        .single();

      if (locationError) throw locationError;

      // Call the update handler with the response data
      if (data) {
        await onLocationUpdate(data);
        // Only close if not required
        if (!required) {
          onClose();
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to update location');
      console.error('Error updating location:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {required ? 'Set Your Location' : 'Update Location'}
              </h2>
              {!required && (
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">House No.</label>
                <input
                  type="text"
                  required
                  value={formData.houseNo}
                  onChange={(e) => setFormData({...formData, houseNo: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter house number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Locality</label>
                <input
                  type="text"
                  required
                  value={formData.locality}
                  onChange={(e) => setFormData({...formData, locality: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter locality"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pincode</label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter 6-digit pincode"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                {!required && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : required ? 'Continue' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;