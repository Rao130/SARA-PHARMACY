import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { API_BASE_URL } from '../../config/env';
import axiosInstance from '../../api/axiosInstance';
import axios from 'axios';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select,
  Grid,
  FormHelperText,
  Card,
  CardContent,
  CardMedia,
  Divider,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

// Product categories (per backend enum in models/Medicine.js)
const categories = [
  'prescription',
  'otc',
  'herbal',
  'ayurvedic',
  'homeopathic',
  'surgical',
  'other',
];

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const AddMedicine = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'otc',
    description: '',
    manufacturer: '',
    price: '',
    stock: '',
    strength: '',
    form: 'tablet',
    prescriptionRequired: false,
    minStockLevel: 10,
    image: null,
    expDate: null,
    mfgDate: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState('');
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
    if (!formData.genericName.trim()) newErrors.genericName = 'Generic name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.mfgDate) newErrors.mfgDate = 'Manufacturing date is required';
    if (!formData.expDate) newErrors.expDate = 'Expiry date is required';
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.strength) newErrors.strength = 'Medicine strength is required';
    if (!formData.form) newErrors.form = 'Medicine form is required';
    
    // Validate expiry date is after manufacturing date
    if (formData.mfgDate && formData.expDate) {
      const mfgDate = new Date(formData.mfgDate);
      const expDate = new Date(formData.expDate);
      // Reset time to start of day for accurate comparison
      mfgDate.setHours(0, 0, 0, 0);
      expDate.setHours(0, 0, 0, 0);
      
      if (expDate <= mfgDate) {
        newErrors.expDate = 'Expiry date must be after manufacturing date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Reset errors when form data changes
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      validateForm();
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (name) => (date) => {
    // Ensure we're working with a Date object and handle timezone issues
    const newDate = date ? new Date(date) : null;
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: newDate
      };
      
      // If manufacturing date is being updated and it's after the current expiry date,
      // reset the expiry date to maintain proper date order
      if (name === 'mfgDate' && prev.expDate && newDate > prev.expDate) {
        updatedData.expDate = null;
      }
      
      return updatedData;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      enqueueSnackbar('Please fill in all required fields correctly', { variant: 'error' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Build multipart form data to upload image file
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('genericName', formData.genericName.trim());
      fd.append('category', (formData.category || 'other').toLowerCase());
      fd.append('manufacturer', formData.manufacturer.trim());
      fd.append('price', String(Number(formData.price)));
      fd.append('stock', String(Number(formData.stock)));
      fd.append('description', formData.description.trim());
      fd.append('mfgDate', formData.mfgDate ? new Date(formData.mfgDate).toISOString() : '');
      fd.append('expiryDate', formData.expDate ? new Date(formData.expDate).toISOString() : '');
      fd.append('strength', String(formData.strength).trim());
      fd.append('form', String(formData.form).toLowerCase());
      fd.append('prescriptionRequired', String(formData.prescriptionRequired === true));
      fd.append('minStockLevel', String(Number(formData.minStockLevel) || 10));
      if (formData.image) {
        fd.append('image', formData.image);
      }
      
      // Make the actual request (multipart). Do not set Content-Type manually so browser adds boundary.
      await axiosInstance.post('/medicines', fd, { timeout: 15000 });
      
      enqueueSnackbar('Medicine added successfully!', { variant: 'success' });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        genericName: '',
        category: 'otc',
        description: '',
        manufacturer: '',
        price: '',
        stock: '',
        strength: '',
        form: 'tablet',
        prescriptionRequired: false,
        minStockLevel: 10,
        image: null,
        expDate: null,
        mfgDate: null,
      });
      setPreview('');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin');
      }
      
    } catch (error) {
      console.error('Error adding medicine:', error);
      let errorMessage = 'Failed to add medicine';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to the server. Please ensure the backend is running.';
      } else if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        const resp = error.response.data;
        // Prefer detailed Mongoose validation messages if present
        if (resp?.error?.errors) {
          const firstKey = Object.keys(resp.error.errors)[0];
          errorMessage = resp.error.errors[firstKey]?.message || resp.message || 'Validation failed';
        } else if (resp?.error?.message) {
          errorMessage = resp.error.message;
        } else if (resp?.message) {
          errorMessage = resp.message;
        } else {
          errorMessage = `Server responded with status ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response from server.';
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#ffffff' }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: '0 6px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06)',
            backgroundColor: '#1a1a2e',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
        <Typography variant="h4" gutterBottom>
          Add New Medicine
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              {/* Image Upload */}
              <Box sx={{ mb: 3 }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon sx={{ color: '#667eea' }} />}
                  fullWidth
                  sx={{
                    mb: 1.5,
                    py: 1.5,
                    borderStyle: 'dashed',
                    borderColor: 'rgba(100, 108, 255, 0.5)',
                    backgroundColor: 'rgba(100,108,255,0.02)',
                    '&:hover': {
                      borderColor: '#646cff',
                      backgroundColor: 'rgba(100,108,255,0.06)'
                    }
                  }}
                >
                  {formData.image ? 'Change Image' : 'Upload Medicine Image'}
                  <VisuallyHiddenInput 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                </Button>
                <FormHelperText sx={{ mt: 0.5 }}>
                  PNG, JPG up to 5MB
                </FormHelperText>
                {errors.image && (
                  <FormHelperText error>{errors.image}</FormHelperText>
                )}
                
                {preview && (
                  <Card
                    sx={{
                      maxWidth: 220,
                      mt: 2,
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={preview}
                      alt="Medicine preview"
                    />
                  </Card>
                )}
              </Box>

              {/* Basic Info */}
              <Typography variant="h6" sx={{ mt: 1.5, mb: 0.5 }}>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <TextField
                fullWidth
                label="Medicine Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                size="small"
                placeholder="e.g., Paracetamol"
                required
                error={!!errors.name}
                helperText={errors.name}
                InputLabelProps={{ style: { color: '#b0b0b0' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
              
              <TextField
                fullWidth
                label="Generic Name"
                name="genericName"
                value={formData.genericName}
                onChange={handleChange}
                margin="normal"
                size="small"
                placeholder="e.g., Acetaminophen"
                required
                error={!!errors.genericName}
                helperText={errors.genericName}
                InputLabelProps={{ style: { color: '#b0b0b0' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
              
              <FormControl 
                fullWidth 
                margin="normal" 
                required
                error={!!errors.category}
                size="small"
              >
                <InputLabel sx={{ color: '#b0b0b0' }}>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  size="small"
                  sx={{
                    color: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <FormHelperText error>{errors.category}</FormHelperText>
                )}
              </FormControl>
              
              <TextField
                fullWidth
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                margin="normal"
                size="small"
                placeholder="e.g., Cipla, Sun Pharma"
                required
                error={!!errors.manufacturer}
                helperText={errors.manufacturer}
                InputLabelProps={{ style: { color: '#b0b0b0' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
            </Grid>
            
            {/* Right Column */}
            <Grid item xs={12} md={6}>

                <Typography variant="h6" sx={{ mt: { xs: 2, md: 0 }, mb: 0.5 }}>
                  Dates & Form
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <DatePicker
                  label="Manufacturing Date"
                  value={formData.mfgDate}
                  onChange={handleDateChange('mfgDate')}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      size: 'small',
                      error: !!errors.mfgDate,
                      helperText: errors.mfgDate,
                      required: true,
                      InputLabelProps: {
                        shrink: true,
                        style: { color: '#b0b0b0' }
                      },
                      InputProps: { style: { color: '#ffffff' } }
                    }
                  }}
                />
                
                <DatePicker
                  label="Expiry Date"
                  value={formData.expDate}
                  onChange={handleDateChange('expDate')}
                  minDate={formData.mfgDate || new Date()}
                  format="dd/MM/yyyy"
                  disabled={!formData.mfgDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      size: 'small',
                      required: true,
                      error: !!errors.expDate,
                      helperText: errors.expDate || (!formData.mfgDate ? 'Please select manufacturing date first' : ''),
                      InputLabelProps: {
                        shrink: true,
                        style: { color: '#b0b0b0' }
                      },
                      InputProps: { style: { color: '#ffffff' } }
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                label="Strength (e.g., 500mg, 10ml)"
                name="strength"
                value={formData.strength}
                onChange={handleChange}
                margin="normal"
                size="small"
                placeholder="e.g., 500mg"
                required
                error={!!errors.strength}
                helperText={errors.strength}
                InputLabelProps={{ style: { color: '#b0b0b0' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
                
                <FormControl 
                  fullWidth 
                  margin="normal" 
                  required
                  error={!!errors.form}
                  size="small"
                >
                  <InputLabel sx={{ color: '#b0b0b0' }}>Form</InputLabel>
                  <Select
                    name="form"
                    value={formData.form}
                    onChange={handleChange}
                    label="Form"
                    size="small"
                    sx={{
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#667eea',
                      },
                    }}
                  >
                    <MenuItem value="tablet">Tablet</MenuItem>
                    <MenuItem value="capsule">Capsule</MenuItem>
                    <MenuItem value="syrup">Syrup</MenuItem>
                    <MenuItem value="injection">Injection</MenuItem>
                    <MenuItem value="drops">Drops</MenuItem>
                    <MenuItem value="ointment">Ointment</MenuItem>
                    <MenuItem value="cream">Cream</MenuItem>
                    <MenuItem value="gel">Gel</MenuItem>
                    <MenuItem value="spray">Spray</MenuItem>
                    <MenuItem value="inhaler">Inhaler</MenuItem>
                    <MenuItem value="suppository">Suppository</MenuItem>
                    <MenuItem value="powder">Powder</MenuItem>
                    <MenuItem value="solution">Solution</MenuItem>
                    <MenuItem value="suspension">Suspension</MenuItem>
                  </Select>
                  {errors.form && (
                  <FormHelperText error>{errors.form}</FormHelperText>
                )}
              </FormControl>
              <Typography variant="h6" sx={{ mt: 2, mb: 0.5 }}>
                  Pricing & Stock
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <TextField
                  fullWidth
                label="Price (₹)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                margin="normal"
                size="small"
                placeholder="e.g., 49.99"
                inputProps={{ min: 0, step: '0.01' }}
                required
                error={!!errors.price}
                helperText={errors.price}
                InputLabelProps={{ style: { color: '#b0b0b0' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
                
                <TextField
                  fullWidth
                label="Stock Quantity"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                margin="normal"
                size="small"
                placeholder="e.g., 100"
                inputProps={{ min: 0 }}
                required
                error={!!errors.stock}
                helperText={errors.stock}
                InputLabelProps={{ style: { color: '#b0b0b0' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
                
                <TextField
                  fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                size="small"
                multiline
                rows={4}
                required
                error={!!errors.description}
                helperText={errors.description}
                InputLabelProps={{ style: { color: '#b0b0b0' } }}
                InputProps={{ style: { color: '#ffffff' } }}
              />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      name="prescriptionRequired"
                      checked={formData.prescriptionRequired}
                      onChange={handleChange}
                      sx={{ color: '#667eea' }}
                    />
                  }
                  label="Prescription Required"
                  sx={{ mt: 2, color: '#ffffff' }}
                />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Medicine'}
            </Button>
          </Box>
        </Box>
      </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default AddMedicine;
