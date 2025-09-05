import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import axiosInstance from '../../api/axiosInstance';
import OrderManagement from './OrderManagement';
import { toast } from 'react-toastify';

const OrderDetailsModal = ({ open, onClose, orderId, onOrderUpdate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
    }
  }, [open, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      setOrder(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (action) => {
    setUpdating(true);
    try {
      let newStatus;
      if (action === 'accept') {
        newStatus = 'confirmed';
      } else if (action === 'reject') {
        newStatus = 'cancelled';
      }

      // Simple direct status update
      const response = await axiosInstance.patch(`/orders/${orderId}/status`, { 
        status: newStatus 
      });
      
      toast.success(`Order ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
      
      // Update the order state immediately to show new status
      setOrder(prev => ({
        ...prev,
        status: newStatus,
        updatedAt: new Date().toISOString()
      }));
      
      // Update parent component
      if (onOrderUpdate) {
        onOrderUpdate(orderId, newStatus);
      }
      
      // Don't close modal for accepted orders - show management options
      if (action === 'reject') {
        onClose();
      }
      
    } catch (error) {
      console.error(`Error ${action}ing order:`, error);
      toast.error(`Failed to ${action} order: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toFixed(2)}`;
  };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a2e',
          color: '#ffffff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#16213e',
        color: '#ffffff'
      }}>
        Order Details
        <IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, backgroundColor: '#1a1a2e' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress sx={{ color: '#667eea' }} />
          </Box>
        ) : order ? (
          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon sx={{ color: '#667eea', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>Customer Information</Typography>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                    <strong>Name:</strong> {order.user?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#ffffff', mb: 1 }}>
                    <strong>Email:</strong> {order.user?.email || 'N/A'}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={2}>
                    <PhoneIcon sx={{ color: '#667eea', mr: 1 }} />
                    <Typography variant="body1" sx={{ color: '#ffffff' }}>
                      {order.user?.phone || 'No phone number'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Shipping Address */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOnIcon sx={{ color: '#667eea', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>Shipping Address</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#ffffff', lineHeight: 1.6 }}>
                    {order.shippingAddress?.address}<br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                    {order.shippingAddress?.country}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Order Information */}
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <ShoppingCartIcon sx={{ color: '#667eea', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>Order Information</Typography>
                  </Box>
                  
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: '#b0b0b0' }}>Order ID</Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>#{order._id?.slice(-8)}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: '#b0b0b0' }}>Status</Typography>
                      <Box mt={0.5}>
                        <Chip 
                          label={order.status || 'pending'} 
                          color={order.status === 'confirmed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: '#b0b0b0' }}>Payment Method</Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        {order.paymentMethod?.toUpperCase() || 'COD'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" sx={{ color: '#b0b0b0' }}>Order Date</Typography>
                      <Typography variant="body2" sx={{ color: '#ffffff' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Order Items */}
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>Ordered Items</Typography>
                  
                  <TableContainer component={Paper} sx={{ backgroundColor: '#0f1419' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Medicine</TableCell>
                          <TableCell align="center" sx={{ color: '#ffffff', fontWeight: 'bold' }}>Quantity</TableCell>
                          <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 'bold' }}>Price</TableCell>
                          <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 'bold' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.items?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ color: '#ffffff' }}>{item.name}</TableCell>
                            <TableCell align="center" sx={{ color: '#ffffff' }}>{item.quantity}</TableCell>
                            <TableCell align="right" sx={{ color: '#ffffff' }}>{formatPrice(item.price)}</TableCell>
                            <TableCell align="right" sx={{ color: '#ffffff' }}>
                              {formatPrice(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Order Management */}
            {order.status !== 'pending' && (
              <Grid item xs={12}>
                <OrderManagement 
                  order={order} 
                  onOrderUpdate={fetchOrderDetails}
                />
              </Grid>
            )}

            {/* Bill Summary */}
            <Grid item xs={12}>
              <Card sx={{ backgroundColor: '#16213e', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PaymentIcon sx={{ color: '#667eea', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: '#ffffff' }}>Bill Summary</Typography>
                  </Box>
                  
                  <Box sx={{ maxWidth: 300 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography sx={{ color: '#b0b0b0' }}>Items Total:</Typography>
                      <Typography sx={{ color: '#ffffff' }}>{formatPrice(order.itemsPrice)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography sx={{ color: '#b0b0b0' }}>Shipping:</Typography>
                      <Typography sx={{ color: '#ffffff' }}>{formatPrice(order.shippingPrice)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography sx={{ color: '#b0b0b0' }}>Tax:</Typography>
                      <Typography sx={{ color: '#ffffff' }}>{formatPrice(order.taxPrice)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 'bold' }}>Total:</Typography>
                      <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                        {formatPrice(order.totalPrice)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Typography sx={{ color: '#ffffff' }}>No order details available</Typography>
        )}
      </DialogContent>

      {order && order.status === 'pending' && (
        <DialogActions sx={{ p: 3, backgroundColor: '#16213e' }}>
          <Button 
            onClick={() => handleOrderAction('reject')} 
            color="error" 
            variant="outlined"
            disabled={updating}
            sx={{ mr: 1 }}
          >
            {updating ? <CircularProgress size={20} /> : 'Reject Order'}
          </Button>
          <Button 
            onClick={() => handleOrderAction('accept')} 
            color="success" 
            variant="contained"
            disabled={updating}
          >
            {updating ? <CircularProgress size={20} /> : 'Accept Order'}
          </Button>
        </DialogActions>
      )}
      
      {order && order.status !== 'pending' && (
        <DialogActions sx={{ p: 3, backgroundColor: '#16213e' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="body1" sx={{ color: '#ffffff', mr: 2 }}>
              Order Status:
            </Typography>
            <Chip 
              label={order.status.toUpperCase()} 
              color={order.status === 'confirmed' ? 'success' : 
                     order.status === 'delivered' ? 'success' : 
                     order.status === 'cancelled' ? 'error' : 'primary'}
              size="small"
            />
          </Box>
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ color: '#ffffff', borderColor: '#ffffff' }}
          >
            Close
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default OrderDetailsModal;