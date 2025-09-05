import React, { useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading, login } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  
  const verifyAdminStatus = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      
      // If no admin token, we can immediately return
      if (!adminToken) {
        setIsChecking(false);
        return;
      }
      
      // Set the token in axios instance
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
      
      // Verify the token and get user data
      const res = await axiosInstance.get('/auth/me');
      const userData = res.data?.data || res.data;
      
      // If user is not an admin, clear the token
      if (!userData || userData.role !== 'admin') {
        console.error('Access denied: User is not an admin');
        localStorage.removeItem('admin_token');
        setError('Access denied. Admin privileges required.');
      }
      
      // Update auth context
      await login();
      
    } catch (err) {
      console.error('Error verifying admin status:', err);
      // Clear invalid tokens
      localStorage.removeItem('admin_token');
      setError('Session expired. Please log in again.');
    } finally {
      setIsChecking(false);
    }
  }, [login]);

  useEffect(() => {
    verifyAdminStatus();
  }, [verifyAdminStatus]);

  // Show loading indicator while checking auth state
  if (loading || isChecking) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Verifying admin privileges...</Typography>
      </Box>
    );
  }

  // Show error message if verification failed
  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1">
          Redirecting to login...
        </Typography>
        {setTimeout(() => {
          return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
        }, 2000)}
      </Box>
    );
  }

  // Not logged in, redirect to login with redirect back URL
  if (!currentUser) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Logged in but not admin, redirect to home
  if (!isAdmin) {
    return <Navigate to="/" state={{ from: location, message: 'Access denied. Admin privileges required.' }} replace />;
  }

  // Authorized admin, render the protected children
  return children;
};

export default AdminRoute;
