import { Box, Typography, Grid, Card, CardContent, CardActionArea, CardMedia, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';


const features = [
  {
    title: 'Medicines',
    description: 'Browse and order from our wide range of medicines',
    icon: <MedicationIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
    path: '/medicines'
  },
  {
    title: 'My Orders',
    description: 'Track and manage your medicine orders',
    icon: <ReceiptIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
    path: '/orders'
  },
  {
    title: 'Symptom Checker',
    description: 'Check your symptoms and get medicine recommendations',
    icon: <HealthAndSafetyIcon sx={{ fontSize: 60, color: 'success.main' }} />,
    path: '/symptom-checker'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('Fetching announcements...');
        // Fetch announcements from the correct endpoint
        const res = await axiosInstance.get('/announcements');
        console.log('Announcements API response:', res);
        if (mounted) {
          // Check if the response has data and is successful
          if (res?.data?.success) {
            console.log('Setting offers:', res.data.items || []);
            setOffers(res.data.items || []);
          } else {
            console.error('Invalid response format from announcements API:', res.data);
            setOffers([
              { _id: '1', title: 'Special Offer', message: 'Get 20% off on all medicines this week!', type: 'offer' },
              { _id: '2', title: 'Free Delivery', message: 'Free delivery on orders above ₹499', type: 'offer' }
            ]);
          }
        }
      } catch (e) {
        // silent fail for home
      } finally {
        mounted && setLoadingOffers(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Realtime updates via WebSocket - Temporarily disabled
  // useEffect(() => {
  //   const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  //   const wsUrl = `${protocol}://${window.location.host}/ws`;
  //   const ws = new WebSocket(wsUrl);
  //   ws.onmessage = (evt) => {
  //     try {
  //       const msg = JSON.parse(evt.data);
  //       if (msg?.type === 'announcement:new' && msg?.payload) {
  //         setOffers((prev) => [{ ...msg.payload }, ...prev].slice(0, 20));
  //       }
  //       if (msg?.type === 'announcement:deleted' && msg?.payload?._id) {
  //         setOffers((prev) => prev.filter((it) => it._id !== msg.payload._id));
  //       }
  //     } catch (_) {}
  //   };
  //   return () => ws.close();
  // }, []);

  const handleTrackClick = () => {
    // Track Order feature removed - placeholder
    console.log('Track Order feature has been removed');
  };

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 2, md: 4 },
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
      <Paper
        elevation={0}
        sx={{
          mb: 5,
          p: { xs: 3, md: 6 },
          textAlign: 'center',
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <LocalHospitalIcon sx={{ fontSize: 72, color: 'white', mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          Welcome to Sara Pharmacy
        </Typography>
        <Typography variant="h5" sx={{ maxWidth: 720, mx: 'auto', opacity: 0.9, fontWeight: 400 }}>
          Your trusted healthcare partner - delivering wellness to your doorstep
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {/* Featured: Latest Offers - show all offers here */}
        {offers.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', textAlign: 'center', mb: 2 }}>
                ✨ Latest Offers
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {offers.map((o) => (
                <Grid key={o._id} item xs={12} sm={6} md={4}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      borderRadius: 4, 
                      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                      boxShadow: '0 12px 32px rgba(251, 146, 60, 0.15)',
                      transition: 'all 0.4s ease',
                      border: '1px solid rgba(251, 146, 60, 0.2)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 20px 40px rgba(251, 146, 60, 0.25)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="subtitle2" color="warning.dark" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                        🔥 {o.type || 'offer'}
                      </Typography>
                      <Typography variant="h5" sx={{ mt: 1, fontWeight: 800, color: 'text.primary' }}>
                        {o.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.6 }}>
                        {o.message}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
        {features.map((feature, index) => {
          const isTrack = false; // Track Order feature removed
          return (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                border: '1px solid rgba(0,0,0,0.05)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  borderColor: 'primary.main',
                  '& .feature-icon': {
                    transform: 'scale(1.1)',
                  }
                }
              }}
            >
              <CardActionArea 
                component={isTrack ? 'div' : Link}
                to={isTrack ? undefined : feature.path}
                onClick={isTrack ? handleTrackClick : undefined}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 4,
                  textAlign: 'center',
                  textDecoration: 'none',
                  borderRadius: 4,
                }}
              >
                <Box sx={{ mb: 3, transition: 'transform 0.4s ease' }} className="feature-icon">
                  {feature.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Typography gutterBottom variant="h4" component="div" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '1.1rem' }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
