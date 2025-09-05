import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Grid,
  IconButton,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Restaurant,
  Assignment,
  DirectionsBike,
  LocationOn,
  Phone,
  Star,
  Timer,
  Refresh,
  MyLocation
} from '@mui/icons-material';
import { io } from 'socket.io-client';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const OrderTracker = ({ orderId, onClose }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [deliveryPartnerLocation, setDeliveryPartnerLocation] = useState(null);
  const [liveTrackingEnabled, setLiveTrackingEnabled] = useState(false);
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const autoRefreshRef = useRef(null);

  const statusSteps = [
    { key: 'confirmed', label: 'Order Confirmed', icon: <CheckCircle />, color: '#4caf50' },
    { key: 'preparing', label: 'Preparing Order', icon: <Restaurant />, color: '#ff9800' },
    { key: 'packed', label: 'Order Packed', icon: <Assignment />, color: '#2196f3' },
    { key: 'assigned', label: 'Delivery Partner Assigned', icon: <DirectionsBike />, color: '#9c27b0' },
    { key: 'picked_up', label: 'Order Picked Up', icon: <LocalShipping />, color: '#3f51b5' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: <LocationOn />, color: '#ff5722' },
    { key: 'delivered', label: 'Delivered', icon: <CheckCircle />, color: '#4caf50' }
  ];

  useEffect(() => {
    fetchTrackingData();
    setupWebSocket();
    
    // Auto-refresh order status every 10 seconds
    autoRefreshRef.current = setInterval(() => {
      fetchTrackingData();
      console.log('🔄 Auto-refreshing order status...');
    }, 10000);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [orderId]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/orders/${orderId}/live-tracking`);
      setTrackingData(response.data.data);
      
      if (response.data.data.order.timeRemaining) {
        setTimeRemaining(response.data.data.order.timeRemaining);
        startCountdown(response.data.data.order.timeRemaining);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast.error('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    socketRef.current = io('/', {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to tracking WebSocket');
      socketRef.current.emit('joinOrderRoom', { orderId });
    });

    socketRef.current.on('orderTrackingUpdate', (data) => {
      if (data.orderId === orderId) {
        setTrackingData(prev => ({
          ...prev,
          order: {
            ...prev.order,
            status: data.status,
            estimatedDeliveryTime: data.estimatedDeliveryTime
          },
          tracking: [...prev.tracking, data.tracking]
        }));
        
        toast.success(`Order ${data.status.replace('_', ' ')}!`);
      }
    });

    socketRef.current.on('deliveryPartnerAssigned', (data) => {
      if (data.orderId === orderId) {
        setTrackingData(prev => ({
          ...prev,
          deliveryPartner: data.deliveryPartner,
          order: {
            ...prev.order,
            estimatedDeliveryTime: data.estimatedDeliveryTime
          }
        }));
        
        toast.success(`Delivery partner ${data.deliveryPartner.name} assigned!`);
      }
    });

    socketRef.current.on('deliveryPartnerLocationUpdate', (data) => {
      if (data.orderId === orderId) {
        setDeliveryPartnerLocation(data.location);
        
        // Calculate estimated distance if customer location is available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const customerLat = position.coords.latitude;
            const customerLng = position.coords.longitude;
            const partnerLat = data.location.latitude;
            const partnerLng = data.location.longitude;
            
            const distance = calculateDistance(customerLat, customerLng, partnerLat, partnerLng);
            setEstimatedDistance(distance);
          });
        }
        
        toast.info('🚛 Delivery partner location updated!');
      }
    });
  };

  const startCountdown = (seconds) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return 'Delivered';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  const enableLiveTracking = () => {
    if (navigator.geolocation) {
      setLiveTrackingEnabled(true);
      toast.success('🗺️ Live tracking enabled!');
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const openGoogleMaps = () => {
    if (deliveryPartnerLocation) {
      const { latitude, longitude } = deliveryPartnerLocation;
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15`;
      window.open(mapsUrl, '_blank');
    }
  };

  const getCurrentStepIndex = () => {
    if (!trackingData) return 0;
    return statusSteps.findIndex(step => step.key === trackingData.order.status);
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / statusSteps.length) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!trackingData) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="error">
          Unable to load tracking information
        </Typography>
        <Button onClick={fetchTrackingData} startIcon={<Refresh />} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Header with Timer */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Order #{trackingData.order._id.slice(-8)}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              ₹{trackingData.order.totalPrice} • {trackingData.order.items.length} items
            </Typography>
          </Box>
          <Box textAlign="center">
            {timeRemaining > 0 ? (
              <>
                <Typography variant="h4" fontWeight="bold">
                  {formatTime(timeRemaining)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Estimated arrival
                </Typography>
              </>
            ) : (
              <Chip
                label="Delivered"
                color="success"
                size="large"
                sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}
              />
            )}
          </Box>
        </Box>
        
        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={getProgressPercentage()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: '#FFD700'
              }
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.9 }}>
            {Math.round(getProgressPercentage())}% Complete
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Status Timeline */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order Status
            </Typography>
            <Stepper activeStep={getCurrentStepIndex()} orientation="vertical">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= getCurrentStepIndex();
                const tracking = trackingData.tracking.find(t => t.status === step.key);
                
                return (
                  <Step key={step.key} completed={isCompleted}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isCompleted ? step.color : '#e0e0e0',
                            color: 'white'
                          }}
                        >
                          {step.icon}
                        </Box>
                      )}
                    >
                      <Typography variant="subtitle1" fontWeight={isCompleted ? 'bold' : 'normal'}>
                        {step.label}
                      </Typography>
                      {tracking && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(tracking.timestamp).toLocaleTimeString()}
                        </Typography>
                      )}
                    </StepLabel>
                    <StepContent>
                      {tracking && tracking.message && (
                        <Typography variant="body2" color="text.secondary">
                          {tracking.message}
                        </Typography>
                      )}
                    </StepContent>
                  </Step>
                );
              })}
            </Stepper>
          </Paper>
        </Grid>

        {/* Delivery Partner Info */}
        <Grid item xs={12} md={4}>
          {trackingData.deliveryPartner ? (
            <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                🚚 Delivery Partner
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar
                  src={trackingData.deliveryPartner.profilePhoto}
                  sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}
                >
                  {trackingData.deliveryPartner.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {trackingData.deliveryPartner.name}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Star sx={{ fontSize: 16, color: '#ffc107', mr: 0.5 }} />
                    <Typography variant="body2">
                      {trackingData.deliveryPartner.rating || 5.0} • Delivery Partner
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {trackingData.deliveryPartner.vehicleType || 'bike'} • {trackingData.deliveryPartner.vehicleNumber || 'Vehicle info'}
                  </Typography>
                </Box>
              </Box>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Phone />}
                href={`tel:${trackingData.deliveryPartner.phone}`}
                sx={{ mb: 1 }}
              >
                📞 Call {trackingData.deliveryPartner.name}
              </Button>
              
              {deliveryPartnerLocation && (
                <>
                  {/* Live Tracking Section */}
                  {['out_for_delivery', 'in_transit'].includes(trackingData.order.status) && (
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <Alert severity="success" sx={{ mb: 1 }}>
                        🔴 Live location available
                      </Alert>
                      
                      {estimatedDistance && (
                        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                          🗺️ Approximately {estimatedDistance.toFixed(1)} km away
                        </Typography>
                      )}
                      
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<MyLocation />}
                        onClick={openGoogleMaps}
                        color="primary"
                        sx={{ mb: 1 }}
                      >
                        🗺️ View on Google Maps
                      </Button>
                      
                      {!liveTrackingEnabled && (
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<LocationOn />}
                          onClick={enableLiveTracking}
                          size="small"
                        >
                          Enable Live Distance Tracking
                        </Button>
                      )}
                      
                      {liveTrackingEnabled && (
                        <Box sx={{ p: 1, backgroundColor: '#e8f5e8', borderRadius: 1, textAlign: 'center' }}>
                          <Typography variant="caption" color="success.dark">
                            🔄 Live tracking active
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {!['out_for_delivery', 'in_transit'].includes(trackingData.order.status) && (
                    <Button
                      variant="text"
                      fullWidth
                      startIcon={<LocationOn />}
                      size="small"
                      sx={{ color: 'success.main' }}
                    >
                      🟢 Live Location Available
                    </Button>
                  )}
                </>
              )}
              
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                <Typography variant="caption" color="success.dark">
                  ✅ Your delivery partner has been assigned and will deliver your order soon!
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Paper elevation={2} sx={{ p: 3, mb: 2, textAlign: 'center' }}>
              <DirectionsBike sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Delivery partner will be assigned soon
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                We're finding the best delivery partner for your order
              </Typography>
            </Paper>
          )}

          {/* Order Items */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Order Items
            </Typography>
            {trackingData.order.items.map((item, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {item.name} × {item.quantity}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ₹{item.price} each
                </Typography>
                {index < trackingData.order.items.length - 1 && <Divider sx={{ my: 1 }} />}
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight="bold">
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                ₹{trackingData.order.totalPrice}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderTracker;