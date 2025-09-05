import { Box, Button, Paper, Stack, TextField, Typography, Alert, Link, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Check for success message in location state or route state
  useEffect(() => {
    // Check URL params first
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    
    // Then check route state
    const routeState = location.state;
    
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
      // Clear the message from URL
      const url = new URL(window.location);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url);
    } else if (routeState?.message) {
      setSuccessMessage(routeState.message);
      
      // Pre-fill email if provided in state
      if (routeState.email) {
        setEmail(routeState.email);
      }
      
      // Clear the state to avoid showing the message again on refresh
      window.history.replaceState({}, '');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Clear any existing tokens first
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      
      // Use the login function from AuthContext which now handles the login flow
      const user = await login({ email, password });
      
      if (!user) {
        throw new Error('Login failed. Please check your credentials and try again.');
      }
      
      console.log('Login successful, user role:', user.role);
      
      // Redirect based on role
      const redirectPath = location.state?.from?.pathname || 
                         (user.role === 'admin' ? '/admin' : '/profile');
      
      console.log(`Redirecting to: ${redirectPath}`);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        console.log('Already authenticated, checking role...', { isAdmin });
        
        // Get the redirect path from URL params or state
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect') || location.state?.from?.pathname;
        
        // If there's a specific redirect path and it's not the login page
        if (redirectTo && !redirectTo.includes('/login')) {
          console.log('Redirecting to requested path:', redirectTo);
          navigate(redirectTo, { replace: true });
          return;
        }
        
        // Otherwise, redirect based on role
        const targetPath = isAdmin ? '/admin' : '/profile';
        console.log('No specific redirect, going to:', targetPath);
        navigate(targetPath, { replace: true });
      }
    };

    checkAuth();
  }, [isAuthenticated, isAdmin]);

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 0,
      m: 0,
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <Container maxWidth="sm">
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 40px 80px rgba(0, 0, 0, 0.15)'
            }
          }}
          component="form" 
          onSubmit={handleSubmit}
        >
          <Stack spacing={4} alignItems="center">
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <LocalHospitalIcon 
                sx={{ 
                  fontSize: 64, 
                  color: 'primary.main',
                  mb: 2,
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))'
                }} 
              />
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  color: 'primary.main',
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                Welcome Back
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  opacity: 0.8
                }}
              >
                Sign in to your Sara Pharmacy account
              </Typography>
            </Box>

            {successMessage && (
              <Alert 
                severity="success" 
                sx={{ 
                  width: '100%', 
                  borderRadius: 2,
                  backgroundColor: 'success.light',
                  color: 'success.contrastText'
                }}
              >
                {successMessage}
              </Alert>
            )}
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  borderRadius: 2,
                  backgroundColor: 'error.light',
                  color: 'error.contrastText'
                }}
              >
                {error}
              </Alert>
            )}

            <Stack spacing={3} sx={{ width: '100%' }}>
              <TextField 
                label="Email Address" 
                type="email" 
                required 
                fullWidth 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
                placeholder="Enter your email"
              />
              
              <TextField 
                label="Password" 
                type="password" 
                required 
                fullWidth 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
                placeholder="Enter your password"
              />

              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)'
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #ccc 0%, #999 100%)'
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>

            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: 'center',
                color: 'text.secondary',
                fontSize: '1rem'
              }}
            >
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Create one
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
