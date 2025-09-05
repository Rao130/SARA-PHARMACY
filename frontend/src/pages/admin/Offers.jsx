import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Chip,
  Divider,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { API_BASE_URL } from '../../config/env';
import axiosInstance from '../../api/axiosInstance';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Validation schema for offer form
const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  code: yup.string().required('Coupon code is required'),
  discountType: yup.string().required('Discount type is required'),
  discountValue: yup
    .number()
    .required('Discount value is required')
    .positive('Must be a positive number')
    .when('discountType', {
      is: 'percentage',
      then: yup.number().max(100, 'Percentage cannot be greater than 100'),
    }),
  minPurchase: yup.number().min(0, 'Minimum purchase cannot be negative'),
  maxDiscount: yup.number().min(0, 'Max discount cannot be negative'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  isActive: yup.boolean(),
});

// Backend-connected Admin Offers page posts to /api/v1/announcements

const Offers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [offers, setOffers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true,
      image: null,
    },
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      try {
        console.log('Submitting form with values:', values);
        const offerData = {
          ...values,
          image: imagePreview || ''
        };

        if (editingOffer) {
          // Update existing offer
          const updatedOffers = offers.map((offer) =>
            offer.id === editingOffer.id 
              ? { ...offerData, id: editingOffer.id } 
              : offer
          );
          setOffers(updatedOffers);
        } else {
          // Add new offer
          const newOffer = {
            ...offerData,
            id: offers.length > 0 ? Math.max(...offers.map(o => o.id)) + 1 : 1
          };
          setOffers([...offers, newOffer]);
        }
        
        setOpenDialog(false);
        resetForm();
        setImagePreview('');
        setSelectedFile(null);
      } catch (error) {
        console.error('Error submitting offer:', error);
      }
    },
  });

  // Debug effect to log state changes
  React.useEffect(() => {
    console.log('Dialog open state:', openDialog);
  }, [openDialog]);

  const handleOpenDialog = (offer = null) => {
    console.log('Opening dialog for offer:', offer);
    if (offer) {
      // If editing an existing offer, set its values
      formik.setValues({
        ...offer,
        startDate: new Date(offer.startDate),
        endDate: new Date(offer.endDate)
      });
      setImagePreview(offer.image || '');
      setEditingOffer(offer);
    } else {
      // If adding a new offer, reset the form
      formik.resetForm({
        values: {
          title: '',
          description: '',
          code: '',
          discountType: 'percentage',
          discountValue: '',
          minPurchase: '',
          maxDiscount: '',
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          isActive: true,
          image: null,
        }
      });
      setImagePreview('');
      setSelectedFile(null);
      setEditingOffer(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Don't reset form here to prevent flickering when dialog closes
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await axiosInstance.delete(`/announcements/${id}`);
      setOffers((prev) => prev.filter((offer) => offer.id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to delete offer');
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleOfferStatus = (id) => {
    setOffers(
      offers.map((offer) =>
        offer.id === id ? { ...offer, isActive: !offer.isActive } : offer
      )
    );
  };

  // Fetch announcements from backend
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/announcements');
        const data = res.data;
        if (data?.success) {
          // Normalize to offers shape for UI compatibility
          const items = (data.items || []).map((a) => ({
            id: a._id,
            title: a.title,
            description: a.message,
            code: '',
            discountType: 'percentage',
            discountValue: '',
            minPurchase: 0,
            maxDiscount: 0,
            startDate: a.createdAt || new Date().toISOString(),
            endDate: a.expiresAt || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            isActive: a.active,
            image: '',
          }));
          setOffers(items);
        } else {
          setError(data?.message || 'Failed to load announcements');
        }
      } catch (e) {
        setError(e.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Helper to compose backend message from form values
  const buildAnnouncementPayload = (values) => {
    const parts = [];
    if (values.description) parts.push(values.description);
    if (values.code) parts.push(`Use code ${values.code}`);
    if (values.discountType && values.discountValue) {
      const tag = values.discountType === 'percentage' ? `${values.discountValue}% OFF` : `₹${values.discountValue} OFF`;
      parts.push(tag);
    }
    if (values.minPurchase) parts.push(`Min purchase ₹${values.minPurchase}`);
    return {
      title: values.title,
      message: parts.join(' • '),
      type: 'offer',
      active: !!values.isActive,
    };
  };

  return (
    <Container maxWidth="xl" sx={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#ffffff', py: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ color: '#ffffff' }}>
          Manage Offers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            console.log('Add button clicked');
            handleOpenDialog();
          }}
          sx={{ zIndex: 1 }}
        >
          Add New Offer
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, color: 'error.main', backgroundColor: '#1a1a2e' }}>{error}</Paper>
      )}
      <Grid container spacing={3}>
        {offers.map((offer) => (
          <Grid item xs={12} sm={6} md={4} key={offer.id}>
            <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                    backgroundColor: '#1a1a2e',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
              {offer.image && (
                <CardMedia
                  component="img"
                  height="140"
                  image={offer.image}
                  alt={offer.title}
                />
              )}
              <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                  <Chip
                    label={offer.isActive ? 'Active' : 'Inactive'}
                    color={offer.isActive ? 'success' : 'default'}
                    size="small"
                    onClick={() => toggleOfferStatus(offer.id)}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
                <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#ffffff' }}>
                  {offer.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }} paragraph>
                  {offer.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={offer.code}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                  <Chip
                    label={
                      offer.discountType === 'percentage'
                        ? `${offer.discountValue}% OFF`
                        : `$${offer.discountValue} OFF`
                    }
                    color="secondary"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Valid: {new Date(offer.startDate).toLocaleDateString()} -{' '}
                  {new Date(offer.endDate).toLocaleDateString()}
                </Typography>
                {offer.minPurchase > 0 && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    Min. purchase: ${offer.minPurchase}
                  </Typography>
                )}
              </CardContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(offer)}
                  sx={{ 
                    color: '#667eea',
                    '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.2)' }
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteOffer(offer.id)}
                  sx={{ 
                    color: '#ff4757',
                    '&:hover': { backgroundColor: 'rgba(255, 71, 87, 0.2)' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Offer Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
        disableEnforceFocus
        PaperProps={{ sx: { backgroundColor: '#1a1a2e', color: '#ffffff' } }}
      >
        <DialogTitle sx={{ color: '#ffffff' }}>
          {editingOffer ? 'Edit Offer' : 'Add New Offer'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const isValid = await formik.validateForm();
            if (Object.keys(isValid).length > 0) return;
            // POST to announcements API (create only)
            try {
              const payload = buildAnnouncementPayload(formik.values);
              const res = await axiosInstance.post('/announcements', payload);
              const data = res.data;
              if (data?.success) {
                const a = data.item;
                const newOffer = {
                  id: a._id,
                  title: a.title,
                  description: a.message,
                  code: formik.values.code,
                  discountType: formik.values.discountType,
                  discountValue: formik.values.discountValue,
                  minPurchase: formik.values.minPurchase,
                  maxDiscount: formik.values.maxDiscount,
                  startDate: a.createdAt || new Date().toISOString(),
                  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                  isActive: a.active,
                  image: imagePreview || '',
                };
                setOffers((prev) => [newOffer, ...prev]);
                setOpenDialog(false);
                formik.resetForm();
                setImagePreview('');
                setSelectedFile(null);
              } else {
                alert(data?.message || 'Failed to create announcement');
              }
            } catch (err) {
              alert(err.message || 'Network error');
            }
          }}
        >
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Offer Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  margin="normal"
                  InputLabelProps={{ style: { color: '#b0b0b0' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />

                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                  margin="normal"
                  InputLabelProps={{ style: { color: '#b0b0b0' } }}
                  InputProps={{ style: { color: '#ffffff' } }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <TextField
                    fullWidth
                    id="code"
                    name="code"
                    label="Coupon Code"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.code && Boolean(formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code}
                    InputLabelProps={{ style: { color: '#b0b0b0' } }}
                    InputProps={{ style: { color: '#ffffff' } }}
                  />
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.discountType &&
                      Boolean(formik.errors.discountType)
                    }
                    margin="normal"
                  >
                    <InputLabel id="discount-type-label" sx={{ color: '#b0b0b0' }}>Discount Type</InputLabel>
                    <Select
                      labelId="discount-type-label"
                      id="discountType"
                      name="discountType"
                      value={formik.values.discountType}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Discount Type"
                      sx={{ color: '#ffffff' }}
                    >
                      <MenuItem value="percentage" sx={{ color: '#ffffff', backgroundColor: '#1a1a2e' }}>Percentage</MenuItem>
                      <MenuItem value="fixed" sx={{ color: '#ffffff', backgroundColor: '#1a1a2e' }}>Fixed Amount</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <TextField
                    fullWidth
                    id="discountValue"
                    name="discountValue"
                    label={
                      formik.values.discountType === 'percentage'
                        ? 'Discount Percentage'
                        : 'Discount Amount (₹)'
                    }
                    type="number"
                    value={formik.values.discountValue}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.discountValue &&
                      Boolean(formik.errors.discountValue)
                    }
                    helperText={
                      formik.touched.discountValue && formik.errors.discountValue
                    }
                    InputProps={{
                      endAdornment: formik.values.discountType === 'percentage' ? '%' : '₹',
                      style: { color: '#ffffff' }
                    }}
                    InputLabelProps={{ style: { color: '#b0b0b0' } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <TextField
                    fullWidth
                    id="minPurchase"
                    name="minPurchase"
                    label="Minimum Purchase (₹)"
                    type="number"
                    value={formik.values.minPurchase}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.minPurchase &&
                      Boolean(formik.errors.minPurchase)
                    }
                    helperText={
                      formik.touched.minPurchase && formik.errors.minPurchase
                    }
                    InputLabelProps={{ style: { color: '#b0b0b0' } }}
                    InputProps={{ style: { color: '#ffffff' } }}
                  />
                  <TextField
                    fullWidth
                    id="maxDiscount"
                    name="maxDiscount"
                    label={
                      formik.values.discountType === 'percentage'
                        ? 'Max Discount (₹)'
                        : 'Max Discount'
                    }
                    type="number"
                    value={formik.values.maxDiscount}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.maxDiscount &&
                      Boolean(formik.errors.maxDiscount)
                    }
                    helperText={
                      formik.touched.maxDiscount && formik.errors.maxDiscount
                    }
                    disabled={formik.values.discountType !== 'percentage'}
                    InputLabelProps={{ style: { color: '#b0b0b0' } }}
                    InputProps={{ style: { color: '#ffffff' } }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <DatePicker
                      label="Start Date"
                      value={formik.values.startDate}
                      onChange={(date) =>
                        formik.setFieldValue('startDate', date, true)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={
                            formik.touched.startDate &&
                            Boolean(formik.errors.startDate)
                          }
                          helperText={
                            formik.touched.startDate && formik.errors.startDate
                          }
                        />
                      )}
                    />
                    <DatePicker
                      label="End Date"
                      value={formik.values.endDate}
                      onChange={(date) =>
                        formik.setFieldValue('endDate', date, true)
                      }
                      minDate={formik.values.startDate}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={
                            formik.touched.endDate &&
                            Boolean(formik.errors.endDate)
                          }
                          helperText={
                            formik.touched.endDate && formik.errors.endDate
                          }
                        />
                      )}
                    />
                  </Box>
                </LocalizationProvider>

                <Box sx={{ mt: 3, mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="offer-image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="offer-image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      {imagePreview || editingOffer?.image
                        ? 'Change Image'
                        : 'Upload Offer Image'}
                    </Button>
                  </label>
                  {(imagePreview || (editingOffer && editingOffer.image)) && (
                    <Box
                      sx={{
                        mt: 2,
                        position: 'relative',
                        width: '100%',
                        height: 200,
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      <img
                        src={imagePreview || editingOffer.image}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  )}
                </Box>

                <FormControl fullWidth margin="normal">
                  <InputLabel id="offer-status-label">Status</InputLabel>
                  <Select
                    labelId="offer-status-label"
                    id="isActive"
                    name="isActive"
                    value={formik.values.isActive}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Status"
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingOffer ? 'Update Offer' : 'Create Offer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Offers;
