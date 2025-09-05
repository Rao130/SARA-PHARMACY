import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const UpiPayment = ({ orderId, amount, onSuccess, onClose }) => {
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePayment = async () => {
    if (!upiId) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Call backend API to process UPI payment
      const { data } = await axiosInstance.post('/payment/upi', {
        orderId,
        upiId
      });

      if (data.success) {
        setPaymentStatus('success');
        setShowSuccess(true);
        onSuccess && onSuccess(data.order);
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose && onClose();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', my: 4 }}>
      <Typography variant="h6" gutterBottom align="center">
        UPI Payment
      </Typography>
      
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="primary">
          ₹{amount.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Order #{orderId}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Enter UPI ID"
          placeholder="example@upi"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          variant="outlined"
          disabled={isProcessing}
          sx={{ mb: 2 }}
        />
        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
          Example: 1234567890@ybl, 9876543210@okbizaxis
        </Typography>
      </Box>

      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        onClick={handlePayment}
        disabled={isProcessing || !upiId}
        startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>

      <Dialog open={showSuccess} onClose={handleClose}>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Payment Successful
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>Your payment of ₹{amount.toFixed(2)} has been received.</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Order ID: {orderId}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UpiPayment;
