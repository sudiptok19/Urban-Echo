import React from 'react';

const NotificationBell = ({ notifications, onClick }) => {
  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-blue-600"
    >
      <i className="fas fa-bell text-xl"></i>
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;