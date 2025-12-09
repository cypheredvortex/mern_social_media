import { createContext, useState, useEffect } from "react";
import api from "../lib/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Fetch current user on load (if using token in localStorage)
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
    
    if (userId && username && role) {
      // Restore user from localStorage
      const userData = {
        _id: userId,
        username: username,
        role: role,
      };
      setUser(userData);
      
      // Set authorization header
      const token = localStorage.getItem("token");
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    }
  }, []);

  // Login
  const login = async (email, password) => {
    const res = await api.post("/users/login", { email, password });
    const userData = res.data.user; // backend returns { message, user }

    // Store user data in localStorage for persistence
    localStorage.setItem("token", userData._id || "token"); // Using _id as token for now
    localStorage.setItem("userId", userData._id);
    localStorage.setItem("username", userData.username);
    localStorage.setItem("role", userData.role);
    
    // Set authorization header
    api.defaults.headers.common["Authorization"] = `Bearer ${userData._id}`;

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
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};