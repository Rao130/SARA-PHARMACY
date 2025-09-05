import React, { useEffect, useMemo, useState } from 'react';
import { Container, Typography, Box, TextField, Button, Avatar, Grid, Paper, Alert, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';

export default function Profile() {
  const { currentUser, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Local editable state seeded from currentUser
  const [user, setUser] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setError('');
      setSaving(true);
      await axiosInstance.put('/auth/me', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      });
      // Refresh context user
      await login();
      setIsEditing(false);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!currentUser) {
    // While auth loads elsewhere, just show a loader
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
              <PersonIcon sx={{ fontSize: 50 }} />
            </Avatar>
            <div>
              <Typography variant="h4" component="h1">
                {user.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Member since {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleString(undefined, { month: 'long', year: 'numeric' }) : '—'}
              </Typography>
            </div>
          </Box>
          {!isEditing ? (
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit Profile
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.secondary' }}>
              Personal Information
            </Typography>
            
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={user.name}
              onChange={handleChange}
              margin="normal"
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={user.email}
              onChange={handleChange}
              margin="normal"
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
            />
            
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              margin="normal"
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.secondary' }}>
              Address
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Delivery Address"
              name="address"
              value={user.address}
              onChange={handleChange}
              margin="normal"
              disabled={!isEditing}
              variant={isEditing ? "outlined" : "filled"}
            />
            
            <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'text.secondary' }}>
                Account Security
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => {}}
                disabled={isEditing}
              >
                Change Password
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
