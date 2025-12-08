import { useState } from "react";
import api from "../../lib/axios";

const NotificationItem = ({ notification, onDelete }) => {
  const [read, setRead] = useState(notification.read || false);

  const markAsRead = async () => {
    try {
      await api.put(`/notifications/${notification._id}`, { ...notification, read: true });
      setRead(true);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async () => {
    try {
      await api.delete(`/notifications/${notification._id}`);
      if (onDelete) onDelete(notification._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`p-2 border-b ${read ? "bg-gray-100" : "bg-white"}`}>
      <p>{notification.content}</p>
      <small className="text-gray-500">{new Date(notification.createdAt).toLocaleString()}</small>
      <div className="flex space-x-2 mt-1">
        {!read && <button onClick={markAsRead} className="text-blue-500">Mark as read</button>}
        <button onClick={deleteNotification} className="text-red-500">Delete</button>
      </div>
    </div>
  );
};

export default NotificationItem;
