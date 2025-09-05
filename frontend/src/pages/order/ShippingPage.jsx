import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

const steps = ['Shipping', 'Payment', 'Confirmation'];

const ShippingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
  });

  const { address, city, postalCode, country } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save shipping address to local storage
    localStorage.setItem('shippingAddress', JSON.stringify(formData));
    // Navigate to checkout
    navigate('/checkout');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shipping
      </Typography>
      
      <Stepper activeStep={0} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Shipping Address
        </Typography>
        
        <TextField
          fullWidth
          required
          label="Address"
          name="address"
          value={address}
          onChange={handleChange}
          margin="normal"
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <TextField
            required
            label="City"
            name="city"
            value={city}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            required
            label="Postal Code"
            name="postalCode"
            value={postalCode}
            onChange={handleChange}
            fullWidth
          />
        </Box>
        
        <TextField
          fullWidth
          required
          label="Country"
          name="country"
          value={country}
          onChange={handleChange}
          margin="normal"
        />
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            Continue to Payment
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ShippingPage;