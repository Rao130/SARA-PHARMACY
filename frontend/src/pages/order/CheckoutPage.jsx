import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import PaymentOptions from '../../components/payment/PaymentOptions';

const steps = ['Shipping', 'Payment', 'Confirmation'];

const CheckoutPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems, shippingAddress } = useSelector((state) => state.cart);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
    } else if (!shippingAddress) {
      navigate('/shipping');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    } else if (activeStep === 0) {
      calculateOrder();
    }
  }, [userInfo, navigate, shippingAddress, cartItems, activeStep]);

  const calculateOrder = () => {
    const itemsPrice = cartItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const taxPrice = Number((0.18 * itemsPrice).toFixed(2));
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    setOrder({
      orderItems: cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id,
      })),
      shippingAddress,
      paymentMethod: 'UPI',
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/orders', order, config);
      setOrder({ ...order, _id: data._id });
      setActiveStep(1);
      // Clear cart after successful order
      // dispatch(clearCart());
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Error placing order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderData) => {
    setOrder(orderData);
    setActiveStep(2);
    // Clear cart after successful payment
    // dispatch(clearCart());
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            {cartItems.map((item) => (
              <Box key={item._id} display="flex" mb={2}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: 50, height: 50, objectFit: 'cover' }}
                />
                <Box ml={2}>
                  <Typography variant="body1">{item.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                  </Typography>
                </Box>
              </Box>
            ))}
            <Box mt={3}>
              <Typography variant="h6">
                Subtotal: ₹{order?.itemsPrice?.toFixed(2)}
              </Typography>
              <Typography>Shipping: ₹{order?.shippingPrice?.toFixed(2)}</Typography>
              <Typography>Tax: ₹{order?.taxPrice?.toFixed(2)}</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total: ₹{order?.totalPrice?.toFixed(2)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handlePlaceOrder}
              disabled={loading || !order}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Proceed to Payment'}
            </Button>
          </Paper>
        );
      case 1:
        return (
          order && (
            <PaymentOptions
              orderId={order._id}
              amount={order.totalPrice}
              onSuccess={handlePaymentSuccess}
            />
          )
        );
      case 2:
        return (
          <Paper sx={{ p: 3, mt: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Thank You for Your Order!
            </Typography>
            <Typography variant="body1" paragraph>
              Your order has been placed successfully.
            </Typography>
            <Typography variant="body1" paragraph>
              Order ID: {order?._id}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/order/${order?._id}`)}
              sx={{ mt: 2 }}
            >
              View Order
            </Button>
          </Paper>
        );
      default:
        return <div>404: Not Found</div>;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {getStepContent(activeStep)}
    </Container>
  );
};

export default CheckoutPage;
