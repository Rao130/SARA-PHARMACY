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
  Paper,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../../api/axiosInstance';

// Minimal, clean Offers management for Admin
const OffersSimple = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await axiosInstance.delete(`/announcements/${id}`);
      setItems((prev) => prev.filter((it) => it._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || 'Failed to delete');
    }
  };

  const openDialog = () => {
    setTitle('');
    setDescription('');
    setOpen(true);
  };
  const closeDialog = () => setOpen(false);

  const onSubmit = async (e) => {
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ color: '#ffffff' }}>Admin Offers</Typography>
        <Button variant="contained" startIcon={<AddIcon sx={{ color: '#ffffff' }} />} onClick={openDialog}>
          New Offer
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, backgroundColor: '#1a1a2e', color: '#ffffff' }}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ backgroundColor: '#1a1a2e', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
          <List>
            {items.map((it) => (
              <ListItem key={it._id} divider sx={{ color: '#ffffff' }}
                secondaryAction={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button color="error" variant="outlined" size="small" onClick={() => handleDelete(it._id)}>
                      Delete
                    </Button>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(it._id)} sx={{ color: '#ff4757' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText 
                  primary={<Typography sx={{ color: '#ffffff' }}>{it.title}</Typography>} 
                  secondary={<Typography sx={{ color: '#b0b0b0' }}>{it.message}</Typography>} 
                />
              </ListItem>
            ))}
            {items.length === 0 && (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ color: '#b0b0b0' }}>No offers yet. Create one.</Typography>
              </Box>
            )}
          </List>
        </Paper>
      )}

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm" PaperProps={{ sx: { backgroundColor: '#1a1a2e', color: '#ffffff' } }}>
        <DialogTitle sx={{ color: '#ffffff' }}>New Offer</DialogTitle>
        <Box component="form" onSubmit={onSubmit} noValidate>
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
            <Button onClick={closeDialog} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default OffersSimple;
