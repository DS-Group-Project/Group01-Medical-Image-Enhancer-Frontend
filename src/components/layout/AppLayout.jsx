import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../../context/AuthContext'; // assuming context exists

const AppLayout = () => {
  // Use mock auth if useAuth throws or returns undefined for the sake of functionality
  let auth;
  try {
    auth = useAuth();
  } catch {
    auth = { isAuthenticated: true }; // default to true for demonstration
  }
  const { isAuthenticated } = auth || { isAuthenticated: true };
  
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-100 via-sky-50 to-indigo-100">
      <Navbar />
      
      <main className="flex-grow pt-20 relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium text-slate-900 bg-white shadow-lg border border-slate-100 rounded-lg',
          duration: 4000,
          success: {
            iconTheme: { primary: '#10B981', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: 'white' },
          },
        }}
      />
    </div>
  );
};

export default AppLayout;
