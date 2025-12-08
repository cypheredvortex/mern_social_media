import { createContext, useState, useEffect } from "react";
import api from "../lib/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Optional: Fetch current user on load if token exists
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/users/login", { email, password });
    setUser(res.data);
  };

  const logout = () => {
    setUser(null);
    // Optional: clear token/localStorage
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
