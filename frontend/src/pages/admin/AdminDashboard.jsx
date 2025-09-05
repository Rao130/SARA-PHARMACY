import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Card, CardContent,
  CircularProgress, Paper, Button, Stack, Chip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  LocalMall as OrdersIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import axiosInstance from '../../api/axiosInstance';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import '../../styles/DashboardStyles.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingOrdersLoading, setPendingOrdersLoading] = useState(false);
  const pendingOrdersRefreshRef = useRef(null);
  
  // Modal states
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDashboardStats = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const [ordersResponse, usersResponse, pendingResponse] = await Promise.all([
        axiosInstance.get('/orders/stats/dashboard'),
        axiosInstance.get('/users/count'),
        axiosInstance.get('/orders/pending')
      ]);

      setStats({
        totalOrders: ordersResponse?.data?.totalOrders || 0,
        totalCustomers: usersResponse?.data?.data?.count || 0
      });
      setPendingOrders(pendingResponse?.data?.data || []);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats(true);
    
    // Set up WebSocket connection for real-time updates
    const socket = io('/', {
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('🟢 Admin Dashboard WebSocket connected');
      socket.emit('joinAdminRoom');
    });

    // Real-time customer count updates
    socket.on('userRegistered', () => fetchDashboardStats());
    socket.on('userDeleted', () => fetchDashboardStats());

    // Real-time order count updates
    socket.on('orderCreated', (data) => {
      toast.info('A new order has been placed!');
      fetchDashboardStats();
    });
    socket.on('orderUpdated', () => fetchDashboardStats());
    socket.on('orderCancelled', () => fetchDashboardStats());
    
    // Real-time order status change updates (for total orders count)
    socket.on('orderStatusChanged', (data) => {
      console.log('📊 Order status changed:', data);
      // Update the total orders count immediately
      setStats(prev => ({
        ...prev,
        totalOrders: data.totalOrders
      }));
      toast.success(`Order status updated to ${data.newStatus}!`);
      fetchDashboardStats(); // Also refresh full stats
    });

    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardStats, 5 * 60 * 1000);
    
    // Auto-refresh pending orders every 15 seconds
    pendingOrdersRefreshRef.current = setInterval(() => {
      refreshPendingOrders(false);
    }, 15000);
    
    return () => {
      clearInterval(interval);
      if (pendingOrdersRefreshRef.current) {
        clearInterval(pendingOrdersRefreshRef.current);
      }
      socket.disconnect();
    };
  }, [fetchDashboardStats]);

  // Function to refresh only pending orders
  const handleRefreshClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await refreshPendingOrders(true);
    return false;
  };

  // Function to refresh only pending orders
  const refreshPendingOrders = async (isManual = false) => {
    try {
      if (isManual) {
        setPendingOrdersLoading(true);
        console.log('🔄 Manual refresh of pending orders...');
      } else {
        console.log('🔄 Auto-refreshing pending orders...');
      }
      const pendingResponse = await axiosInstance.get('/orders/pending');
      setPendingOrders(pendingResponse?.data?.data || []);
      if (isManual) {
        toast.success('Pending orders refreshed!');
      }
    } catch (err) {
      console.error('Error refreshing pending orders:', err);
      if (isManual) {
        toast.error('Failed to refresh pending orders');
      }
    } finally {
      if (isManual) {
        setPendingOrdersLoading(false);
      }
    }
  };

  // Modal handlers
  const handleOrderClick = (orderId) => {
    setSelectedOrderId(orderId);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleOrderUpdate = (orderId, newStatus) => {
    // Remove from pending orders if status changed
    setPendingOrders(prev => prev.filter(order => order._id !== orderId));
    // Refresh stats
    fetchDashboardStats();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4, backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }} className="dashboard-header animate-fadeInUp">
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2,
          justifyContent: 'center'
        }}>
          <DashboardIcon sx={{ 
            fontSize: { xs: 32, md: 40 }, 
            mr: 2, 
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            borderRadius: '12px',
            p: 1,
            color: 'white'
          }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.75rem', md: '2rem' },
              background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Admin Dashboard
          </Typography>
        </Box>
        <Typography 
          sx={{ 
            fontSize: { xs: '0.875rem', md: '1rem' },
            opacity: 0.8,
            color: '#b0b0b0'
          }}
        >
          Manage your pharmacy operations efficiently
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }} justifyContent="center">
        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
              className="stats-card-hover animate-slideInLeft"
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                }
              }}
            >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <DashboardIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#667eea' }} />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : error ? (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {error}
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 700, 
                        fontSize: { xs: '1.75rem', md: '2.25rem' },
                        lineHeight: 1
                      }}>
                        {stats.totalOrders.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        opacity: 0.8, 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Total Orders
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Customers */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
              className="stats-card-hover animate-slideInLeft"
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(240, 147, 251, 0.3)',
                }
              }}
            >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <PeopleIcon sx={{ fontSize: { xs: 32, md: 40 }, color: '#667eea' }} />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : error ? (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {error}
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 700, 
                        fontSize: { xs: '1.75rem', md: '2.25rem' },
                        lineHeight: 1
                      }}>
                        {stats.totalCustomers.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        opacity: 0.8, 
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Total Customers
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Pending Orders Panel */}
      <Grid container spacing={2} sx={{ width: '100%', maxWidth: 600 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, md: 3 }, background: '#12193aff', border: '1px solid rgba(45, 12, 12, 0.08)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <OrdersIcon sx={{ color: '#47a7f5ff' }} />
                <Typography variant="h6">Pending Orders</Typography>
                <Chip label={pendingOrders.length} size="small" color="primary" />
                <Typography variant="caption" sx={{ 
                  color: '#4caf50', 
                  fontSize: '0.7rem', 
                  opacity: 0.7,
                  animation: 'pulse 2s infinite'
                }}>
                  • Auto-refresh 15s
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                type="button"
                onClick={handleRefreshClick}
                onMouseDown={(e) => e.preventDefault()}
                onSubmit={(e) => e.preventDefault()}
                disabled={pendingOrdersLoading}
                sx={{ 
                  '&:focus': { outline: 'none' },
                  '&:active': { transform: 'scale(0.98)' }
                }}
              >
                {pendingOrdersLoading ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </Box>
            {pendingOrders.length === 0 ? (
              <Typography color="text.secondary">No pending orders.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {pendingOrders.map(po => (
                  <Box 
                    key={po._id} 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 1, 
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(103, 126, 234, 0.3)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => handleOrderClick(po._id)}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: '#667eea' }}>#{po._id?.slice(-8)}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ₹{Number(po.totalPrice || 0).toFixed(2)} • {new Date(po.createdAt).toLocaleTimeString()}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ color: '#b0b0b0', mt: 0.5 }}>
                          {po.items?.length || 0} items • Click to view details
                        </Typography>
                      </Box>
                      <Box>
                        <Chip 
                          label={po.status || 'pending'} 
                          size="small" 
                          color="warning"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Order Details Modal */}
      <OrderDetailsModal
        open={modalOpen}
        onClose={handleModalClose}
        orderId={selectedOrderId}
        onOrderUpdate={handleOrderUpdate}
      />
      
    </Container>
  );
};

export default AdminDashboard;
