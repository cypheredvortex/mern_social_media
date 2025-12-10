import React from 'react';
import NotificationList from './NotificationList';

const Notifications = ({ notifications, onMarkAsRead, onClearNotifications }) => {
  return (
    <div className="fixed top-16 right-4 w-80 bg-white rounded-lg shadow-lg border z-20">
      <div className="p-4 border-b">
        <h3 className="font-bold">Notifications</h3>
      </div>
      <NotificationList 
        notifications={notifications} 
        onMarkAsRead={onMarkAsRead} 
      />
      <div className="p-2 border-t">
        <button 
          onClick={onClearNotifications}
          className="w-full text-center text-sm text-blue-600 hover:underline"
        >
          Clear all notifications
        </button>
      </div>
    </div>
  );
};

export default Notifications;