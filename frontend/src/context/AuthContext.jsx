import { createContext, useState, useEffect } from "react";
import api from "../lib/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Optional: fetch current user on load (if using token in localStorage)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/users/me"); // you can implement this route if needed
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      logout();
    }
  };

  // Login
  const login = async (email, password) => {
    const res = await api.post("/users/login", { email, password });
    const userData = res.data.user; // backend returns { message, user }

    setUser(userData);

    return userData; // return user for redirect logic
  };

  // Register (calls create_user)
  const register = async (username, email, password) => {
    const res = await api.post("/users", {
      username,
      email,
      password,
      role: "user", // ensure default role
    });

    const userData = res.data;
    setUser(userData); // auto-login after registration
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};