import { useState, useEffect } from "react";
import api from "../../lib/axios";
import NotificationItem from "./NotificationItem";

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n._id !== id));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-6">
      {notifications.map(n => (
        <NotificationItem key={n._id} notification={n} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default NotificationList;
