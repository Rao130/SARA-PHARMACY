import React, { useState } from 'react';
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import UpiPayment from './UpiPayment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import UpiIcon from '@mui/icons-material/AccountBalance';

const PaymentOptions = ({ orderId, amount, onSuccess, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [openUpiDialog, setOpenUpiDialog] = useState(false);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleProceedToPay = () => {
    if (paymentMethod === 'upi') {
      setOpenUpiDialog(true);
    } else {
      // Handle other payment methods
      alert('Selected payment method will be implemented soon');
    }
  };

  const handleUpiPaymentSuccess = (order) => {
    setOpenUpiDialog(false);
    onSuccess && onSuccess(order);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto', my: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select Payment Method
      </Typography>
      
      <RadioGroup
        value={paymentMethod}
        onChange={handlePaymentMethodChange}
        sx={{ mb: 3 }}
      >
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 2,
            border: paymentMethod === 'upi' ? '1px solid #1976d2' : '1px solid #e0e0e0',
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#1976d2',
            },
          }}
          onClick={() => setPaymentMethod('upi')}
        >
          <FormControlLabel
            value="upi"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <UpiIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography>UPI Payment</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Pay using any UPI app like Google Pay, PhonePe, Paytm
                  </Typography>
                </Box>
              </Box>
            }
            sx={{ width: '100%', m: 0 }}
          />
        </Paper>

        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            mb: 2,
            border: paymentMethod === 'card' ? '1px solid #1976d2' : '1px solid #e0e0e0',
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#1976d2',
            },
          }}
          onClick={() => setPaymentMethod('card')}
        >
          <FormControlLabel
            value="card"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CreditCardIcon color="action" sx={{ mr: 1 }} />
                <Box>
                  <Typography>Credit/Debit Card</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Pay using your credit or debit card
                  </Typography>
                </Box>
              </Box>
            }
            sx={{ width: '100%', m: 0 }}
            disabled
          />
        </Paper>

        <Paper 
          elevation={1} 
          sx={{ 
            p: 2,
            border: paymentMethod === 'wallet' ? '1px solid #1976d2' : '1px solid #e0e0e0',
            borderRadius: 1,
            cursor: 'pointer',
            '&:hover': {
              borderColor: '#1976d2',
            },
          }}
          onClick={() => setPaymentMethod('wallet')}
        >
          <FormControlLabel
            value="wallet"
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceWalletIcon color="action" sx={{ mr: 1 }} />
                <Box>
                  <Typography>Wallet</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Pay using your wallet balance
                  </Typography>
                </Box>
              </Box>
            }
            sx={{ width: '100%', m: 0 }}
            disabled
          />
        </Paper>
      </RadioGroup>

      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        onClick={handleProceedToPay}
      >
        Pay ₹{amount.toFixed(2)}
      </Button>

      <Dialog 
        open={openUpiDialog} 
        onClose={() => setOpenUpiDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete UPI Payment</DialogTitle>
        <DialogContent>
          <UpiPayment
            orderId={orderId}
            amount={amount}
            onSuccess={handleUpiPaymentSuccess}
            onClose={() => setOpenUpiDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default PaymentOptions;
