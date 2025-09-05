import { Box, Button, Paper, Stack, TextField, Typography, Alert, Link, Snackbar, InputAdornment, IconButton, LinearProgress, Container } from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Cancel } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('At least 6 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('At least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('At least one special character (!@#$%^&*)');
    }
    return errors;
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*]/.test(password)) strength += 20;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setForm(prev => ({ ...prev, password: value }));
    
    const strength = calculatePasswordStrength(value);
    setPasswordStrength(strength);
    
    const errors = validatePassword(value);
    setPasswordErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    const passwordErrors = validatePassword(form.password);
    if (passwordErrors.length > 0) {
      setError('Please ensure your password meets all requirements');
      return;
    }
    
    setLoading(true);
    
    try {
      // Make sure we're not sending any role to prevent admin signup from frontend
      const { role, ...userData } = form;
      
      // Clear any existing tokens to prevent auto-login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user_token');
      
      // Make the signup request without automatically logging in
      await axiosInstance.post('/auth/register', userData);
      
      // Show success message and redirect to login
      setSnackbar({
        open: true,
        message: 'Registration successful! Please login to continue.',
        severity: 'success'
      });
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login to continue.',
            email: form.email
          },
          replace: true
        });
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      m: 0,
      overflowY: 'auto', // Enable vertical scrolling
      overflowX: 'hidden' // Prevent horizontal scrolling
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
                Create Account
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  opacity: 0.8
                }}
              >
                Join Sara Pharmacy for better healthcare
              </Typography>
            </Box>

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
                label="Full Name" 
                name="name" 
                required 
                fullWidth 
                value={form.name} 
                onChange={handleChange}
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
                placeholder="Enter your full name"
              />
              
              <TextField 
                label="Email Address" 
                type="email" 
                name="email" 
                required 
                fullWidth 
                value={form.email} 
                onChange={handleChange} 
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

              <Box>
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  fullWidth
                  value={form.password}
                  onChange={handlePasswordChange}
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
                  placeholder="Create a strong password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ mt: 2, mb: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={passwordStrength} 
                    color={
                      passwordStrength < 40 ? 'error' : 
                      passwordStrength < 80 ? 'warning' : 'success'
                    }
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    color="textSecondary"
                    sx={{ fontWeight: 600, mt: 0.5, display: 'block' }}
                  >
                    Password strength: {
                      passwordStrength < 40 ? 'Weak' : 
                      passwordStrength < 80 ? 'Moderate' : 'Strong'
                    }
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {[
                    { label: 'At least 6 characters', test: (p) => p.length >= 6 },
                    { label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
                    { label: 'At least one lowercase letter', test: (p) => /[a-z]/.test(p) },
                    { label: 'At least one number', test: (p) => /[0-9]/.test(p) },
                    { label: 'At least one special character (!@#$%^&*)', test: (p) => /[!@#$%^&*]/.test(p) },
                  ].map((rule, index) => {
                    const isMet = rule.test(form.password);
                    return (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {isMet ? 
                          <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} /> : 
                          <Cancel color="error" fontSize="small" sx={{ mr: 1 }} />}
                        <Typography
                          variant="caption"
                          sx={{
                            color: isMet ? 'success.main' : 'error.main',
                            textDecoration: isMet ? 'line-through' : 'none',
                            fontWeight: 500
                          }}
                        >
                          {rule.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <TextField 
                label="Confirm Password" 
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword" 
                required 
                fullWidth 
                value={form.confirmPassword} 
                onChange={handleChange}
                error={Boolean(form.confirmPassword && form.password !== form.confirmPassword)}
                helperText={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords don't match" : ''}
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
                placeholder="Confirm your password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField 
                label="Phone Number" 
                name="phone" 
                required 
                fullWidth 
                value={form.phone} 
                onChange={handleChange} 
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
                placeholder="Enter your phone number"
              />

              <TextField 
                label="Delivery Address" 
                name="address" 
                required 
                fullWidth 
                multiline 
                minRows={3} 
                value={form.address} 
                onChange={handleChange} 
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
                placeholder="Enter your delivery address"
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
                {loading ? 'Creating account...' : 'Sign Up'}
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
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
