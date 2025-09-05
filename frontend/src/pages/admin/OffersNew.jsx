import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axiosInstance from '../../api/axiosInstance';

const OffersNew = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/announcements');
      const data = res.data;
      if (data?.success) {
        setItems(data.items || []);
      } else {
        setError(data?.message || 'Failed to load announcements');
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpen = () => {
    setTitle('');
    setDescription('');
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        title: title.trim(),
        message: description.trim(),
        type: 'offer',
        active: true,
      };
      const res = await axiosInstance.post('/announcements', payload);
      const data = res.data;
      if (data?.success && data.item) {
        setItems((prev) => [data.item, ...prev]);
        setOpen(false);
      } else {
        setError(data?.message || 'Failed to create');
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#ffffff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#ffffff' }}>Manage Offers (Simple)</Typography>
        <Button variant="contained" startIcon={<AddIcon sx={{ color: '#ffffff' }} />} onClick={handleOpen}>
          Add New Offer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, backgroundColor: '#1a1a2e', color: '#ffffff' }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#667eea' }} />
        </Box>
      ) : (
        <List>
          {items.map((it) => (
            <ListItem key={it._id} divider sx={{ color: '#ffffff' }}>
              <ListItemText 
                primary={<Typography sx={{ color: '#ffffff' }}>{it.title}</Typography>} 
                secondary={<Typography sx={{ color: '#b0b0b0' }}>{it.message}</Typography>} 
              />
            </ListItem>
          ))}
          {items.length === 0 && (
            <Typography sx={{ color: '#b0b0b0' }}>No announcements yet.</Typography>
          )}
        </List>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { backgroundColor: '#1a1a2e', color: '#ffffff' } }}>
        <DialogTitle sx={{ color: '#ffffff' }}>New Offer</DialogTitle>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
              InputLabelProps={{ style: { color: '#b0b0b0' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              required
              multiline
              rows={3}
              InputLabelProps={{ style: { color: '#b0b0b0' } }}
              InputProps={{ style: { color: '#ffffff' } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default OffersNew;
