import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AdminRoute = ({ children, requiredRole = 'admin' }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminRole, setAdminRole] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // Check if user is logged in
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('No authenticated user');
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (profileError || profile?.user_type !== 'admin') {
        console.log('User is not admin type');
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // Get admin role
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('role, permissions')
        .eq('id', user.id)
        .single();

      if (adminError || !adminData) {
        console.log('Admin record not found');
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAdminRole(adminData.role);

      // Check role hierarchy
      const roleHierarchy = {
        'super_admin': 3,
        'admin': 2,
        'moderator': 1
      };

      const userLevel = roleHierarchy[adminData.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      const isAuthorized = userLevel >= requiredLevel;
      setAuthorized(isAuthorized);

      if (!isAuthorized) {
        console.log(`Insufficient permissions: ${adminData.role} < ${requiredRole}`);
      }
    } catch (error) {
      console.error('Admin access check error:', error);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #e5e7eb',
          borderTop: '5px solid #2a5298',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#6b7280' }}>Verifying admin access...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!authorized) {
    console.log('Redirecting to admin login - unauthorized');
    return <Navigate to="/icn-admin-login" replace />;
  }

  return children;
};

export default AdminRoute;
