import { useState, useEffect } from "react";
import api from "../../lib/axios";

const UserList = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-2">
      {users.map(u => (
        <div key={u._id} className="flex justify-between p-2 border rounded">
          <p>{u.name}</p>
          <button onClick={() => deleteUser(u._id)} className="text-red-500">Delete</button>
        </div>
      ))}
    </div>
  );
};

export default UserList;
