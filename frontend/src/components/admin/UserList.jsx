import { useState, useEffect } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
      toast.success("User deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Users</h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((skeleton) => (
            <div
              key={skeleton}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
          No users found.
        </p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Placeholder avatar */}
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => deleteUser(user._id)}
                disabled={deletingId === user._id}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  deletingId === user._id
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {deletingId === user._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
