import React, { useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

const UserRoute = ({ children }) => {
  const { currentUser, isAuthenticated, loading, login } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  
  const verifyUserStatus = useCallback(async () => {
    try {
      const userToken = localStorage.getItem('user_token');
      
      // If no user token, we can immediately return
      if (!userToken) {
        setIsChecking(false);
        return;
      }
      
      // Set the token in axios instance
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      // Verify the token and get user data
      const res = await axiosInstance.get('/auth/me');
      const userData = res.data?.data || res.data;
      
      // If user is an admin, they shouldn't be here
      if (userData && userData.role === 'admin') {
        console.error('Access denied: Admin cannot access user routes');
        localStorage.removeItem('user_token');
        setError('Please use the admin interface to access this area.');
        return;
      }
      
      // Update auth context
      await login();
      
    } catch (err) {
      console.error('Error verifying user status:', err);
      // Clear invalid tokens
      localStorage.removeItem('user_token');
      setError('Session expired. Please log in again.');
    } finally {
      setIsChecking(false);
    }
  }, [login]);

  useEffect(() => {
    verifyUserStatus();
  }, [verifyUserStatus]);

  // Show loading indicator while checking auth state
  if (loading || isChecking) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Verifying your session...</Typography>
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
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Logged in as admin trying to access user route
  if (currentUser?.role === 'admin') {
    return <Navigate to="/admin" state={{ from: location, message: 'Please use the admin interface.' }} replace />;
  }

  // Authorized user, render the protected children
  return children;
};

export default UserRoute;
