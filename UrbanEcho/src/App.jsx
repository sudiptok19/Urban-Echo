import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './config/supabaseClient';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/Dashboard';
import Dashboard_admin from './pages/Dashboard_admin';
import { AuthProvider } from './contexts/AuthContext';

const AuthRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      if (adminOnly) {
        // Check if user is admin
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (!profileData || profileData.user_type !== 'authority') {
          navigate('/dashboard', { replace: true });
        }
      }
    };

    checkAuth();
  }, [user, navigate, adminOnly]);

  if (!user) return null;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AuthRoute adminOnly>
                <Dashboard_admin />
              </AuthRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
