import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './config/supabaseClient';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/Dashboard';
import DashboardAdmin from './pages/Dashboard_admin';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/index';


const AuthRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (adminOnly) {
      if (user.user_metadata?.user_type !== 'authority') {
        navigate('/Dashboard', { replace: true });
      }
    }
  }, [user, navigate, adminOnly]);

  if (!user) return null;
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Routes>
          <Route
            path="/Dashboard_admin"
            element={
              <AuthRoute adminOnly={true}>
                <DashboardAdmin />
              </AuthRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
