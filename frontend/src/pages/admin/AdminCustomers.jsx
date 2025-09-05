import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../utils/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const socketRef = useRef(null);
  // Initialize WebSocket connection
  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    
    // Create socket connection with proper configuration
    const socket = io('http://localhost:5006', {
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    
    socketRef.current = socket;
    
    // Connection handlers
    const onConnect = () => {
      console.log('✅ WebSocket connected with ID:', socket.id);
      // Join admin room
      socket.emit('joinAdminRoom');
      
      // Log when admin room is joined
      socket.on('joinedRoom', (room) => {
        console.log(`✅ Joined room: ${room}`);
      });
    };
    
    const onConnectError = (error) => {
      console.error('❌ WebSocket connection error:', error.message);
      setSnackbar({
        open: true,
        message: 'Connection error. Trying to reconnect...',
        severity: 'error'
      });
    };
    
    const onReconnect = (attempt) => {
      console.log(`♻️ Reconnection attempt: ${attempt}`);
    };
    
    const onDisconnect = (reason) => {
      console.log('⚠️ WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Try to reconnect manually
        socket.connect();
      }
    };
    
    // Setup event listeners
    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('reconnect', onReconnect);
    socket.on('disconnect', onDisconnect);
    
    // Listen for new user events
    const onNewUser = (newUser) => {
      console.log('👤 New user received:', newUser);
      setCustomers(prevCustomers => {
        // Check if user already exists to avoid duplicates
        const userExists = prevCustomers.some(user => user._id === newUser._id);
        if (!userExists) {
          return [...prevCustomers, newUser];
        }
        return prevCustomers;
      });
      
      setSnackbar({
        open: true,
        message: `New user registered: ${newUser.name}`,
        severity: 'info'
      });
    };
    
    socket.on('newUser', onNewUser);
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('reconnect', onReconnect);
      socket.off('disconnect', onDisconnect);
      socket.off('newUser', onNewUser);
      
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  // Fetch initial customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log('AdminCustomers - Fetching customers...');
        const response = await api.get('/users');
        
        if (response.data?.data) {
          setCustomers(response.data.data);
        } else {
          console.error('Unexpected response format:', response);
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to load customers',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;

    try {
      await api.delete(`/users/${selectedCustomer._id}`);
      setCustomers(customers.filter(c => c._id !== selectedCustomer._id));
      setSnackbar({
        open: true,
        message: 'Customer deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete customer',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#ffffff', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Customers</Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {customers.length} {customers.length === 1 ? 'Customer' : 'Customers'} Found
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 2, overflow: 'auto', backgroundColor: '#1a1a2e', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Joined On</TableCell>
                <TableCell>Total Orders</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer._id} hover>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{customer.orderCount || 0}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(customer)}
                        sx={{ color: '#ff4757' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="textSecondary">
                      No customers found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        PaperProps={{ sx: { backgroundColor: '#1a1a2e', color: '#ffffff' } }}
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedCustomer?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminCustomers;
