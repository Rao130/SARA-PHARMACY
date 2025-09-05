import { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress, Alert, Container, Chip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!currentUser) {
        navigate('/login', { state: { from: '/orders' } });
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get('/orders');
        setOrders(response.data.data || response.data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Typography variant="h5" gutterBottom component="h1" sx={{ mb: { xs: 2, md: 3 } }}>
        My Orders
      </Typography>
      
      {orders.length === 0 ? (
        <Paper sx={{ p: { xs: 2, md: 4 }, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            You haven't placed any orders yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/medicines" 
            sx={{ mt: 2 }}
          >
            Browse Medicines
          </Button>
        </Paper>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <TableContainer component={Paper} sx={{ 
            boxShadow: { xs: 0, md: 1 },
            borderRadius: { xs: 0, md: 1 },
            mb: 2
          }}>
            <Table sx={{ minWidth: { xs: '100%', sm: 650 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Total Amount</TableCell>
                  <TableCell align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                        {order.orderId || order._id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                      {/* Show total on mobile */}
                      <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' } }}>
                        ₹{order.totalAmount?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status || 'Processing'} 
                        color={
                          order.status === 'delivered' 
                            ? 'success' 
                            : order.status === 'cancelled' 
                            ? 'error' 
                            : 'primary'
                        } 
                        size="small" 
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      ₹{order.totalAmount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                         component={Link}
                         to={`/orders/${order._id}`}
                         size="small"
                         variant="outlined"
                         sx={{ whiteSpace: 'nowrap' }}
                       >
                         View Details
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}
