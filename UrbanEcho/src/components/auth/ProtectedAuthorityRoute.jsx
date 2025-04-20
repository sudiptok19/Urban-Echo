import React from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

const ProtectedAuthorityRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = React.useState(null);

  React.useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('user_type, authority_uid')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setIsAuthorized(data.user_type === 'authority' && data.authority_uid);
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
    }
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/dashboard" />;
};

export default ProtectedAuthorityRoute;