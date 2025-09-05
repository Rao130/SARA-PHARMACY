import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Button,
  Stack,
  Divider,
  LinearProgress
} from '@mui/material';
import { toast } from 'react-toastify';

const statusToStep = {
  pending: 25,
  confirmed: 100,
  preparing: 30,
  packed: 45,
  assigned: 60,
  picked_up: 70,
  in_transit: 85,
  out_for_delivery: 95,
  delivered: 100,
  cancelled: 0
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const autoRefreshRef = useRef(null);

  const fetchOrder = useCallback(async (isMounted) => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/orders/${id}`);
        if (isMounted) {
          setOrder(res.data.data || res.data);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Failed to load order');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    let socket;

    (async () => {
      try {
        await fetchOrder(isMounted);

        const { io } = await import('socket.io-client');
        socket = io('/', { path: '/socket.io/', transports: ['websocket', 'polling'], withCredentials: true });
        
        socket.on('connect', () => {
          console.log(`[Socket] Connected and joining room: order:${id}`);
          socket.emit('joinOrderRoom', { orderId: id });
        });

        socket.on('orderUpdate', (payload) => {
          if (payload?.orderId === id && isMounted) {
            const oldStatus = order?.status;
            setOrder(prev => prev ? ({ ...prev, ...payload.updates }) : null);
            
            // Show specific status update message
            const newStatus = payload.updates.status;
            let message = `Your order status has been updated to "${newStatus}".`;
            
            if (newStatus === 'confirmed') {
              message = '✅ Great! Your order has been confirmed by the admin!';
              toast.success(message);
            } else if (newStatus === 'processing') {
              message = '📦 Your order is now being processed!';
              toast.info(message);
            } else if (newStatus === 'shipped') {
              message = '🚚 Your order has been shipped!';
              toast.info(message);
            } else if (newStatus === 'delivered') {
              message = '🎉 Your order has been delivered!';
              toast.success(message);
            } else {
              toast.info(message);
            }
          }
        });
        
        // Auto-refresh order details every 10 seconds
        autoRefreshRef.current = setInterval(() => {
          if (isMounted) {
            fetchOrder(isMounted);
            console.log('🔄 Auto-refreshing order details...');
          }
        }, 10000);
        
      } catch (e) {
        console.error("Socket initialization failed", e);
      }
    })();

    return () => {
      isMounted = false;
      if (socket) {
        socket.disconnect();
      }
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [id, fetchOrder]);

  const progress = useMemo(() => statusToStep[order?.status] ?? 0, [order]);

  const handleCancel = async (e) => {
    e.preventDefault(); // Prevent any form submission
    setCancelling(true);
    try {
      const res = await axiosInstance.put(`/orders/${id}/cancel`);
      setOrder(res.data.data || res.data);
      toast.success('Your order has been successfully cancelled.');
      // Navigate back to orders page after successful cancellation
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (err) {
      console.error('Error cancelling order:', err);
      const errorMessage = err.response?.data?.message || 'Failed to cancel order. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !order) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !order) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: 3 }}>
          <Typography color="error" gutterBottom>{error}</Typography>
          <Button component={Link} to="/orders" variant="contained">Back to Orders</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h5" gutterBottom>Order Details</Typography>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Order ID: {order?._id}</Typography>
          <Chip 
            label={order?.status}
            color={
              order?.status === 'delivered' ? 'success' : 
              order?.status === 'confirmed' ? 'success' :
              order?.status === 'cancelled' ? 'error' : 
              order?.status === 'shipped' ? 'info' :
              'primary'
            }
            size="small"
          />
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            mt: 2, 
            height: 8, 
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: order?.status === 'confirmed' ? '#4caf50' : 
                              order?.status === 'delivered' ? '#2e7d32' :
                              order?.status === 'shipped' ? '#1976d2' :
                              order?.status === 'cancelled' ? '#d32f2f' : '#1976d2'
            }
          }} 
        />
        <Typography variant="caption" color="text.secondary">
          Status: {order?.status || 'pending'} ({progress}% complete)
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>Items</Typography>
        <Stack spacing={1}>
          {(order?.items || []).map((it, idx) => (
            <Stack key={idx} direction="row" justifyContent="space-between">
              <Typography>{it.name} x {it.quantity}</Typography>
              <Typography>₹{(it.price * it.quantity).toFixed(2)}</Typography>
            </Stack>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={0.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Items</Typography>
            <Typography>₹{Number(order?.itemsPrice || 0).toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Shipping</Typography>
            <Typography>₹{Number(order?.shippingPrice || 0).toFixed(2)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography>Tax</Typography>
            <Typography>₹{Number(order?.taxPrice || 0).toFixed(2)}</Typography>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontWeight: 'bold' }}>Total</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>₹{Number(order?.totalPrice || 0).toFixed(2)}</Typography>
          </Stack>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1}>
          <Button component={Link} to="/orders" variant="outlined">Back</Button>
          
          {/* Live Tracking Button */}
          {order?.status && ['confirmed', 'preparing', 'packed', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(order.status) && (
            <Button 
              component={Link}
              to={`/orders/${id}/live-tracking`}
              variant="contained"
              color="primary"
              sx={{ backgroundColor: '#667eea' }}
            >
              🚚 Track Live
            </Button>
          )}
          
          {order?.status === 'pending' && (
            <Button 
              variant="contained" 
              color="error" 
              type="button"
              onClick={handleCancel} 
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          )}
          
          {order?.status === 'confirmed' && (
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
              ✅ Order Confirmed - Cannot be cancelled
            </Typography>
          )}
          
          {order?.status === 'delivered' && (
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
              🎉 Order Delivered Successfully!
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
