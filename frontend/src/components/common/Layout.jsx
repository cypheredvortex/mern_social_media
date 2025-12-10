import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

const Layout = ({ children, currentUser, onLogout, onSearch, onShowNotifications, notificationCount }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar 
        currentUser={currentUser} 
        onLogout={onLogout} 
        onSearch={onSearch} 
        onShowNotifications={onShowNotifications}
        notificationCount={notificationCount}
      />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;