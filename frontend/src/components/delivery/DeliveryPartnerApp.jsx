import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  DirectionsBike,
  LocationOn,
  CheckCircle,
  Phone,
  Navigation,
  Update
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const DeliveryPartnerApp = ({ partnerId }) => {
  const [currentOrders, setCurrentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);

  const statusFlow = {
    assigned: { next: 'picked_up', label: 'Pick Up Order', color: 'primary' },
    picked_up: { next: 'in_transit', label: 'Start Delivery', color: 'info' },
    in_transit: { next: 'out_for_delivery', label: 'Near Customer', color: 'warning' },
    out_for_delivery: { next: 'delivered', label: 'Mark Delivered', color: 'success' }
  };

  useEffect(() => {
    fetchCurrentOrders();
  }, [partnerId]);

  const fetchCurrentOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/delivery-partners/${partnerId}/current-orders`);
      setCurrentOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Mock data for demo
      setCurrentOrders([
        {
          _id: '674234567890123456789012',
          customer: { name: 'John Doe', phone: '+91 9876543210' },
          shippingAddress: { address: '123 Main St, Delhi', coordinates: [77.2090, 28.6139] },
          items: [{ name: 'Paracetamol', quantity: 2 }, { name: 'Cough Syrup', quantity: 1 }],
          totalPrice: 450,
          status: 'assigned',
          estimatedDeliveryTime: new Date(Date.now() + 30 * 60000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await axiosInstance.patch(`/orders/${orderId}/status-tracking`, {
        status: newStatus,
        message: `Order ${newStatus.replace('_', ' ')} by delivery partner`,
        deliveryPartnerUpdate: true
      });

      // Update location if moving to in_transit
      if (newStatus === 'in_transit') {
        await updateLocation(orderId);
      }

      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}!`);
      fetchCurrentOrders();
      setStatusUpdateDialog(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (orderId) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          await axiosInstance.patch(`/delivery-partners/${partnerId}/location`, {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            orderId
          });
        } catch (error) {
          console.error('Error updating location:', error);
        }
      });
    }
  };

  const getTimeRemaining = (estimatedTime) => {
    const now = new Date();
    const eta = new Date(estimatedTime);
    const diff = eta - now;
    
    if (diff <= 0) return 'Overdue';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    
    return hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <DirectionsBike sx={{ fontSize: 40, mr: 2 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Delivery Partner App
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Manage your deliveries
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Current Orders */}
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Current Orders ({currentOrders.length})
      </Typography>

      {currentOrders.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <DirectionsBike sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No active orders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will receive notifications when new orders are assigned
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {currentOrders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card elevation={2} sx={{ border: '1px solid #e0e0e0' }}>
                <CardContent>
                  {/* Order Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Order #{order._id.slice(-8)}
                    </Typography>
                    <Chip 
                      label={order.status.replace('_', ' ').toUpperCase()}
                      color={statusFlow[order.status]?.color || 'default'}
                      variant="filled"
                    />
                  </Box>

                  {/* Customer Info */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {order.customer.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {order.customer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📞 {order.customer.phone}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Delivery Address */}
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOn sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="body2">
                      {order.shippingAddress.address}
                    </Typography>
                  </Box>

                  {/* Order Items */}
                  <Typography variant="subtitle2" gutterBottom>
                    Items ({order.items.length}):
                  </Typography>
                  <Box sx={{ pl: 2, mb: 2 }}>
                    {order.items.map((item, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        • {item.name} × {item.quantity}
                      </Typography>
                    ))}
                  </Box>

                  {/* Amount & ETA */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      ₹{order.totalPrice}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ETA: {getTimeRemaining(order.estimatedDeliveryTime)}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={<Phone />}
                      href={`tel:${order.customer.phone}`}
                      size="small"
                    >
                      Call
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<Navigation />}
                      onClick={() => {
                        const coords = order.shippingAddress.coordinates;
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`);
                      }}
                      size="small"
                    >
                      Navigate
                    </Button>

                    {statusFlow[order.status] && (
                      <Button
                        variant="contained"
                        startIcon={<Update />}
                        onClick={() => {
                          setSelectedOrder(order);
                          setStatusUpdateDialog(true);
                        }}
                        color={statusFlow[order.status].color}
                        size="small"
                      >
                        {statusFlow[order.status].label}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onClose={() => setStatusUpdateDialog(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Update order #{selectedOrder._id.slice(-8)} status to:
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {statusFlow[selectedOrder.status]?.label}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdateDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => updateOrderStatus(selectedOrder._id, statusFlow[selectedOrder.status].next)}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Confirm Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default DeliveryPartnerApp;