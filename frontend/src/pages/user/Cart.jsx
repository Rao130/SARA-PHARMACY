import { useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Button, 
  Stack, 
  Divider, 
  CardMedia,
  TextField,
  Paper,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Delete } from '@mui/icons-material';
import { useCart } from '../../contexts/CartContext';
import axiosInstance from '../../api/axiosInstance';

export default function Cart() {
  const { items, updateQty, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  const totals = useMemo(() => {
    const totalQty = items.reduce((s, x) => s + x.quantity, 0);
    const totalAmt = items.reduce((s, x) => s + x.quantity * x.price, 0);
    return { totalQty, totalAmt };
  }, [items]);

  const uploadsBase = useMemo(() => {
    try {
      const u = new URL(axiosInstance.defaults.baseURL, window.location.origin);
      return `${u.origin}/uploads`;
    } catch {
      return '/uploads';
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const placeOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Validate form
    const { address, city, postalCode, country, phone } = formData;
    if (!address?.trim() || !city?.trim() || !postalCode?.trim() || !country?.trim() || !phone?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const orderData = {
        items: items.map(item => ({
          medicine: item.medicine || item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        shippingAddress: {
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          phone: phone.trim()
        },
        paymentMethod: 'cod',
        itemsPrice: items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        shippingPrice: 0,
        taxPrice: 0,
        totalPrice: items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      };
      
      console.log('Sending order data:', JSON.stringify(orderData, null, 2));
      
      const { data } = await axiosInstance.post('/orders', orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Clear cart on successful order
      clear();
      
      const newOrder = data.data || data;
      navigate(`/orders/${newOrder._id}`);
      
    } catch (error) {
      console.error('Order error:', error);
      let message = 'Error placing order';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        if (error.response.status === 401) {
          message = 'Please login to place an order';
          navigate('/login');
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        } else if (error.response.data?.error) {
          message = error.response.data.error;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        message = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        message = error.message || 'Error setting up the request';
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>Your Cart</Typography>
      
      {items.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" gutterBottom>Your cart is empty</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/medicines')}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="h6" gutterBottom>Order Items</Typography>
              <Stack spacing={{ xs: 1, sm: 2 }}>
                {items.map((item) => (
                  <Card key={item.medicine} variant="outlined">
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={{ xs: 1, sm: 2 }} 
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <CardMedia
                            component="img"
                            sx={{ 
                              width: { xs: 60, sm: 80 }, 
                              height: { xs: 60, sm: 80 }, 
                              objectFit: 'contain',
                              mr: 2
                            }}
                            src={item.image ? `${uploadsBase}/${item.image}` : '/no-image.png'}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/no-image.png';
                            }}
                            alt={item.name}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ₹{item.price.toFixed(2)} x {item.quantity}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'row', sm: 'column' },
                          justifyContent: { xs: 'space-between', sm: 'flex-end' },
                          alignItems: { xs: 'center', sm: 'flex-end' },
                          width: '100%',
                          mt: { xs: 1, sm: 0 }
                        }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            mt: { xs: 0, sm: 1 }
                          }}>
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => updateQty(item.medicine, Math.max(1, Number(e.target.value)))}
                              inputProps={{ min: 1 }}
                              sx={{ width: { xs: 60, sm: 80 } }}
                            />
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => removeItem(item.medicine)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Order Summary and Checkout */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              position: { md: 'sticky' }, 
              top: 20,
              mb: { xs: 2, md: 0 }
            }}>
              <Typography variant="h6" gutterBottom>Order Summary</Typography>
              <Divider sx={{ my: { xs: 1, sm: 2 } }} />
              
              <Stack spacing={1} mb={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontSize: { sm: '0.9rem', md: '1rem' } }}>
                    Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ₹{totals.totalAmt.toFixed(2)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontSize: { sm: '0.9rem', md: '1rem' } }}>Shipping</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>Free</Typography>
                </Stack>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontWeight: 'bold' }}>Total</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>₹{totals.totalAmt.toFixed(2)}</Typography>
                </Stack>
              </Stack>

              {/* Shipping Details Form */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  Shipping Details
                </Typography>
                <Stack spacing={{ xs: 1.5, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Full Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    size="small"
                    variant="outlined"
                    placeholder="Enter your full address"
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      size="small"
                      variant="outlined"
                      placeholder="Enter your city"
                    />
                    <TextField
                      fullWidth
                      label="Postal Code"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                      size="small"
                      variant="outlined"
                      placeholder="Enter postal code"
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    size="small"
                    variant="outlined"
                    placeholder="Enter your phone number"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  />
                </Stack>
              </Box>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={placeOrder}
                disabled={loading || items.length === 0}
                sx={{ 
                  mt: { xs: 1, sm: 2 },
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                {loading ? 'Placing Order...' : 'Place Order (Cash on Delivery)'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
