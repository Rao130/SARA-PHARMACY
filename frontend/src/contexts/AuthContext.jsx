import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

// Create the context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user from API if token exists
  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (!isMounted) return;
      
      try {
        console.log('AuthContext - Initializing authentication...');
        
        // Skip initialization if we're on an auth page
        const isAuthPage = ['/login', '/register', '/admin/login'].some(path => 
          window.location.pathname.includes(path)
        );
        
        if (isAuthPage) {
          setLoading(false);
          return;
        }
        
        // Check for admin token first
        let token = localStorage.getItem('admin_token');
        let isAdminFlow = !!token;
        
        // If no admin token, check for user token
        if (!token) {
          token = localStorage.getItem('user_token');
          isAdminFlow = false;
        }
        
        // If still no token, check for legacy token
        if (!token) {
          token = localStorage.getItem('token');
          if (token) {
            // Migrate legacy token to appropriate storage
            const tempAxios = axiosInstance;
            delete tempAxios.defaults.headers.common['Authorization'];
            try {
              const res = await tempAxios.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
                skipAuthRedirect: true // Custom flag to prevent redirects
              });
              
              const userData = res.data?.data || res.data;
              if (userData) {
                const storageKey = userData.role === 'admin' ? 'admin_token' : 'user_token';
                localStorage.setItem(storageKey, token);
                localStorage.removeItem('token');
                isAdminFlow = userData.role === 'admin';
                
                // Set user data
                if (isMounted) {
                  setCurrentUser(userData);
                }
              }
            } catch (e) {
              console.warn('Error migrating legacy token:', e);
              localStorage.removeItem('token');
              token = null;
            }
          }
        }
        
        if (!token) {
          console.log('AuthContext - No valid token found');
          if (isMounted) setLoading(false);
          return;
        }
        
        console.log('AuthContext - Token found, verifying...');
        
        try {
          // Create a new axios instance for this request to avoid interfering with global config
          const tempAxios = axios.create({
            baseURL: axiosInstance.defaults.baseURL,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            skipAuthRedirect: true // Prevent redirects for this request
          });
          
          const res = await tempAxios.get('/auth/me');
          const userData = res.data?.data || res.data || null;
          
          if (userData && isMounted) {
            // Verify the role matches the token type
            const isAdmin = userData.role === 'admin';
            if ((isAdmin && !isAdminFlow) || (!isAdmin && isAdminFlow)) {
              console.log('AuthContext - Role mismatch, logging out...');
              throw new Error('Role mismatch');
            }
            
            // Store the token in the correct location
            const storageKey = isAdmin ? 'admin_token' : 'user_token';
            localStorage.setItem(storageKey, token);
            localStorage.removeItem(isAdmin ? 'user_token' : 'admin_token');
            localStorage.removeItem('token');
            
            // Update axios instance with the correct token
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            console.log('AuthContext - User authenticated:', { role: userData.role });
            setCurrentUser(userData);
          } else if (!userData) {
            throw new Error('Invalid user data');
          }
        } catch (e) {
          console.error('Error verifying token:', e);
          // Clear invalid tokens
          localStorage.removeItem('admin_token');
          localStorage.removeItem('user_token');
          localStorage.removeItem('token');
          delete axiosInstance.defaults.headers.common['Authorization'];
          
          if (isMounted) {
            setCurrentUser(null);
          }
        }
      } catch (e) {
        // Clear invalid tokens
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user_token');
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  const login = async (credentials) => {
    try {
      // If credentials are provided, perform login
      if (credentials) {
        const { email, password } = credentials;
        const response = await axiosInstance.post('/auth/login', { email, password });
        
        const { token, refreshToken, user } = response.data?.data || response.data;
        
        if (!token || !user) {
          throw new Error('Invalid login response');
        }
        
        // Store tokens based on user role
        const storageKey = user.role === 'admin' ? 'admin_token' : 'user_token';
        localStorage.setItem(storageKey, token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        
        // Set auth header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setCurrentUser(user);
        return user;
      } 
      // If no credentials provided, check existing token
      else {
        const adminToken = localStorage.getItem('admin_token');
        const userToken = localStorage.getItem('user_token');
        const token = adminToken || userToken;
        
        if (!token) {
          return null;
        }
        
        // Set auth header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user data
        const res = await axiosInstance.get('/auth/me');
        const user = res.data?.data || res.data || null;
        
        if (user) {
          // Ensure token is stored in the correct location
          if (user.role === 'admin' && !adminToken) {
            localStorage.setItem('admin_token', token);
            localStorage.removeItem('user_token');
          } else if (user.role !== 'admin' && !userToken) {
            localStorage.setItem('user_token', token);
            localStorage.removeItem('admin_token');
          }
          
          setCurrentUser(user);
          return user;
        }
        return null;
      }
    } catch (error) {
      console.error('Error in login function:', error);
      // Clear invalid tokens
      localStorage.removeItem('admin_token');
      localStorage.removeItem('user_token');
      localStorage.removeItem('refresh_token');
      setCurrentUser(null);
      return null;
    }
  };

  const clearAllTokens = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user_token');
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  const logout = async () => {
    // Clear all tokens and reset state
    clearAllTokens();
    setCurrentUser(null);
    
    // Redirect to login page
    window.location.href = '/login';
  };

  // Force logout function that can be called from anywhere
  const forceLogout = (message = 'Your session has expired. Please log in again.') => {
    clearAllTokens();
    setCurrentUser(null);
    return message;
  };

  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      // Clear any existing tokens first
      clearAllTokens();
      
      // Make registration request
      const res = await axiosInstance.post('/auth/register', userData);
      const data = res.data;
      
      // Handle successful registration
      if (data?.token && data?.user) {
        // Store token based on user role
        const storageKey = data.user.role === 'admin' ? 'admin_token' : 'user_token';
        localStorage.setItem(storageKey, data.token);
        
        // Set auth header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Update auth state
        setCurrentUser(data.user);
        return { success: true, user: data.user };
      }
      
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Prepare context value
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    loading,
    login,
    logout,
    register,
    forceLogout,
    clearAllTokens
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
