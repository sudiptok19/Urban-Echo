import React from 'react';
import { supabase } from '../config/supabaseClient';

const NotificationModal = ({ isOpen, onClose, notification, onConfirm }) => {
  if (!isOpen) return null;

  const handleResponse = async (response) => {
    try {
      // Update notification status
      const { error: notificationError } = await supabase
        .from('notifications')
        .update({ status: response })
        .eq('id', notification.id);

      if (notificationError) throw notificationError;

      onConfirm(response);
      onClose();
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Confirm Resolution</h3>
        <p className="text-gray-600 mb-6">{notification.message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => handleResponse('rejected')}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
          >
            No, Not Resolved
          </button>
          <button
            onClick={() => handleResponse('approved')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Yes, Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;