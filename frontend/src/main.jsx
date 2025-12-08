import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);