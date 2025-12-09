import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import SearchResultsPage from "./pages/SearchResultsPage";
import AdminPanel from "./pages/AdminPanel";

import Navbar from "./components/common/NavBar";
import Sidebar from "./components/common/SideBar";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";


// ✅ Protect routes based on authentication
const PrivateRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // not logged in → redirect to login
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    // logged in but role not allowed → redirect home
    return <Navigate to="/home" />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* Default route — show login if not logged in */}
      <Route
        path="/"
        element={
          user ? (
            user.role === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/home" />
            )
          ) : (
            <Login />
          )
        }
      />

      {/* Auth & Register - redirect if already logged in */}
      <Route 
        path="/login" 
        element={
          user ? (
            user.role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          ) : (
            <Login />
          )
        } 
      />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute roles={["admin"]}>
            <AdminPanel />
          </PrivateRoute>
        }
      />

      {/* Other protected pages */}
      <Route
        path="/post/:id"
        element={
          <PrivateRoute>
            <PostDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/explore"
        element={
          <PrivateRoute>
            <Explore />
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <SearchResultsPage />
          </PrivateRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="flex min-h-screen">
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-4">
              <AppRoutes />
            </main>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
