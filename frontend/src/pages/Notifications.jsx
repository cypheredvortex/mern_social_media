import NotificationList from "../components/notifications/NotificationList";

const Notifications = () => {
  return (
    <div className="max-w-2xl mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <NotificationList />
    </div>
  );
};

export default Notifications;