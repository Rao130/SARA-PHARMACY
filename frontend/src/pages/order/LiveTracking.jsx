import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Box } from '@mui/material';
import OrderTracker from '../../components/order/OrderTracker';

const LiveTracking = () => {
  const { id } = useParams();

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: '100vh' }}>
      <OrderTracker orderId={id} />
    </Container>
  );
};

export default LiveTracking;