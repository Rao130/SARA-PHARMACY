import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Avatar,
  Card,
  CardContent,
  TextField
} from '@mui/material';
import {
  Assignment,
  DirectionsBike,
  LocationOn,
  Phone,
  Star
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const OrderManagement = ({ order, onOrderUpdate }) => {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [quickCreateDialogOpen, setQuickCreateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({
    name: '',
    phone: ''
  });

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed', color: 'success' },
    { value: 'preparing', label: 'Preparing', color: 'warning' },
    { value: 'packed', label: 'Packed', color: 'info' },
    { value: 'assigned', label: 'Assigned', color: 'primary' },
    { value: 'picked_up', label: 'Picked Up', color: 'secondary' },
    { value: 'in_transit', label: 'In Transit', color: 'primary' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'warning' },
    { value: 'delivered', label: 'Delivered', color: 'success' }
  ];

  useEffect(() => {
    if (assignDialogOpen) {
      fetchDeliveryPartners();
    }
  }, [assignDialogOpen]);

  // Refresh delivery partners when order status changes
  useEffect(() => {
    if (order?.status === 'confirmed' || order?.status === 'preparing' || order?.status === 'packed') {
      // Refresh available partners when order becomes ready for assignment
    }
  }, [order?.status]);

  const fetchDeliveryPartners = async () => {
    try {
      // This endpoint would need to be created
      const response = await axiosInstance.get('/delivery-partners/available');
      setDeliveryPartners(response.data.data || []);
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
      // Mock data for demo
      setDeliveryPartners([
        {
          _id: '1',
          name: 'Rajesh Kumar',
          phone: '+91 9876543210',
          vehicleType: 'bike',
          vehicleNumber: 'DL-01-AB-1234',
          rating: 4.8,
          profilePhoto: 'https://via.placeholder.com/150'
        },
        {
          _id: '2',
          name: 'Amit Singh',
          phone: '+91 9876543211',
          vehicleType: 'scooter',
          vehicleNumber: 'DL-02-CD-5678',
          rating: 4.6,
          profilePhoto: 'https://via.placeholder.com/150'
        }
      ]);
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedPartner) {
      toast.error('Please select a delivery partner');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post(`/orders/${order._id}/assign-delivery-partner`, {
        deliveryPartnerId: selectedPartner
      });
      
      toast.success('Delivery partner assigned successfully!');
      setAssignDialogOpen(false);
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error assigning delivery partner:', error);
      toast.error('Failed to assign delivery partner');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`/orders/${order._id}/assign-delivery-partner`, {
        autoAssign: true
      });
      
      toast.success('Delivery partner auto-assigned successfully!');
      setAssignDialogOpen(false);
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error auto-assigning delivery partner:', error);
      toast.error('Failed to auto-assign delivery partner');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreateAndAssign = async () => {
    if (!newPartnerForm.name.trim() || !newPartnerForm.phone.trim()) {
      toast.error('Please enter both name and phone number');
      return;
    }

    setLoading(true);
    try {
      // Create delivery partner with quick form data
      const partnerData = {
        name: newPartnerForm.name.trim(),
        phone: newPartnerForm.phone.trim(),
        vehicleType: 'bike',
        vehicleNumber: `DL-${Date.now().toString().slice(-4)}`,
        email: `${newPartnerForm.name.toLowerCase().replace(/\s+/g, '')}@delivery.sara.com`,
        isQuickCreated: true
      };

      // Assign to order immediately
      await axiosInstance.post(`/orders/${order._id}/assign-delivery-partner`, {
        partnerData: partnerData,
        quickCreate: true
      });
      
      toast.success(`Delivery partner ${newPartnerForm.name} created and assigned successfully!`);
      setQuickCreateDialogOpen(false);
      setNewPartnerForm({ name: '', phone: '' });
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error creating and assigning delivery partner:', error);
      toast.error('Failed to create and assign delivery partner');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoProgress = async () => {
    setLoading(true);
    try {
      await axiosInstance.post(`/orders/${order._id}/auto-progress`);
      
      toast.success('Order status automatically progressed!');
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error auto-progressing order:', error);
      toast.error('Failed to auto-progress order status');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.patch(`/orders/${order._id}/status-tracking`, {
        status: newStatus,
        message: `Order ${newStatus.replace('_', ' ')} by admin`
      });
      
      toast.success('Order status updated successfully!');
      setStatusDialogOpen(false);
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'default';
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Order Management
        </Typography>
        
        {/* Status Change Success Message */}
        {order.status === 'confirmed' && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: '#e8f5e8', borderRadius: 2, border: '1px solid #4caf50' }}>
            <Typography variant="body2" color="success.main" fontWeight="bold">
              ✅ Order has been accepted! You can now manage delivery and updates.
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Chip 
              label={order.status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(order.status)}
              variant="filled"
            />
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              onClick={() => setStatusDialogOpen(true)}
              startIcon={<Assignment />}
            >
              Update Status
            </Button>
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleAutoProgress}
              disabled={loading}
              startIcon={<Assignment />}
            >
              Auto Progress
            </Button>
          </Grid>
          
          {!order.deliveryPartner && ['confirmed', 'preparing', 'packed'].includes(order.status) && (
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setQuickCreateDialogOpen(true)}
                startIcon={<DirectionsBike />}
              >
                Assign Partner
              </Button>
            </Grid>
          )}
          
          {!order.deliveryPartner && ['confirmed', 'preparing', 'packed'].includes(order.status) && (
            <Grid item>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setAssignDialogOpen(true)}
                startIcon={<DirectionsBike />}
                size="small"
              >
                Choose Existing
              </Button>
            </Grid>
          )}
        </Grid>

        {order.deliveryPartner && (
          <Card sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Assigned Delivery Partner
              </Typography>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ mr: 2 }}>
                  {order.deliveryPartner.name?.charAt(0) || 'D'}
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {order.deliveryPartner.name || 'Delivery Partner'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.deliveryPartner.phone || 'Phone not available'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* Quick Create Delivery Partner Dialog */}
      <Dialog open={quickCreateDialogOpen} onClose={() => setQuickCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create & Assign Delivery Partner</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Quickly create a new delivery partner and assign to this order.
            </Typography>
            
            <TextField
              fullWidth
              label="Partner Name"
              value={newPartnerForm.name}
              onChange={(e) => setNewPartnerForm(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              placeholder="Enter delivery partner name"
              required
            />
            
            <TextField
              fullWidth
              label="Phone Number"
              value={newPartnerForm.phone}
              onChange={(e) => setNewPartnerForm(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number (e.g., +91 9876543210)"
              required
            />
            
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                📝 Note: Vehicle details will be auto-generated. You can edit them later.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleQuickCreateAndAssign} 
            variant="contained"
            disabled={loading || !newPartnerForm.name.trim() || !newPartnerForm.phone.trim()}
          >
            {loading ? 'Creating...' : 'Create & Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Delivery Partner Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Assign Delivery Partner</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAutoAssign}
              disabled={loading}
              fullWidth
              sx={{ mb: 2 }}
            >
              Auto-Assign Nearest Partner
            </Button>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Or select manually from available partners:
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {deliveryPartners.map((partner) => (
              <Grid item xs={12} sm={6} key={partner._id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedPartner === partner._id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:hover': { boxShadow: 3 }
                  }}
                  onClick={() => setSelectedPartner(partner._id)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar src={partner.profilePhoto} sx={{ mr: 2 }}>
                        {partner.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {partner.name}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Star sx={{ fontSize: 16, color: '#ffc107', mr: 0.5 }} />
                          <Typography variant="body2">
                            {partner.rating}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {partner.vehicleType} • {partner.vehicleNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📞 {partner.phone}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignPartner} 
            variant="contained"
            disabled={!selectedPartner || loading}
          >
            Assign Selected Partner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Chip 
                    label={option.label}
                    color={option.color}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            disabled={!newStatus || loading}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderManagement;