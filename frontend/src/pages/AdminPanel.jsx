import UserList from "../components/admin/UserList";
import ReportList from "../components/admin/ReportList";

const AdminPanel = () => {
  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <div>
        <h2 className="font-bold mb-2">Users</h2>
        <UserList />
      </div>
      <div>
        <h2 className="font-bold mb-2">Reports</h2>
        <ReportList />
      </div>
    </div>
  );
};

export default AdminPanel;
