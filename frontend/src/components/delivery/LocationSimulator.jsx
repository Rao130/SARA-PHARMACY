import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import {
  MyLocation,
  DirectionsBike,
  PlayArrow,
  Stop
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const LocationSimulator = ({ orderId, deliveryPartner }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 28.6139, // Default Delhi coordinates
    longitude: 77.2090
  });
  const [simulationInterval, setSimulationInterval] = useState(null);

  // Sample route coordinates (Delhi area)
  const routeCoordinates = [
    { latitude: 28.6139, longitude: 77.2090 }, // Start
    { latitude: 28.6149, longitude: 77.2100 },
    { latitude: 28.6159, longitude: 77.2110 },
    { latitude: 28.6169, longitude: 77.2120 },
    { latitude: 28.6179, longitude: 77.2130 },
    { latitude: 28.6189, longitude: 77.2140 }, // End (customer location)
  ];

  const [routeIndex, setRouteIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationInterval]);

  const startSimulation = () => {
    setIsSimulating(true);
    setRouteIndex(0);
    
    const interval = setInterval(() => {
      setRouteIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        
        if (nextIndex >= routeCoordinates.length) {
          // Simulation complete
          setIsSimulating(false);
          clearInterval(interval);
          toast.success('🎯 Delivery simulation completed!');
          return prevIndex;
        }
        
        const newLocation = routeCoordinates[nextIndex];
        setCurrentLocation(newLocation);
        
        // Send location update to backend
        updateDeliveryPartnerLocation(newLocation);
        
        return nextIndex;
      });
    }, 3000); // Update every 3 seconds
    
    setSimulationInterval(interval);
    toast.info('🚀 Location simulation started!');
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
    toast.info('⏹️ Location simulation stopped');
  };

  const updateDeliveryPartnerLocation = async (location) => {
    try {
      // This would normally be done by the delivery partner's mobile app
      // For simulation, we'll directly update via API
      await axiosInstance.post('/orders/delivery-partner/update-location', {
        orderId: orderId,
        latitude: location.latitude,
        longitude: location.longitude
      });
      
      console.log('📍 Location updated:', location);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const progress = routeCoordinates.length > 0 ? (routeIndex / (routeCoordinates.length - 1)) * 100 : 0;

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        📍 Delivery Location Simulator
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        This simulator mimics a delivery partner moving towards the customer location
      </Alert>
      
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Current Location
              </Typography>
              <Typography variant="body2">
                📍 Lat: {currentLocation.latitude.toFixed(4)}
              </Typography>
              <Typography variant="body2">
                📍 Lng: {currentLocation.longitude.toFixed(4)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Progress: {routeIndex}/{routeCoordinates.length - 1} stops
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Box display="flex" flexDirection="column" gap={2}>
            {!isSimulating ? (
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={startSimulation}
                color="primary"
                fullWidth
              >
                Start Delivery Simulation
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Stop />}
                onClick={stopSimulation}
                color="error"
                fullWidth
              >
                Stop Simulation
              </Button>
            )}
            
            <Chip 
              label={isSimulating ? 'Moving...' : 'Stationary'}
              color={isSimulating ? 'success' : 'default'}
              icon={<DirectionsBike />}
            />
          </Box>
        </Grid>
      </Grid>
      
      {isSimulating && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            📱 Simulating delivery partner movement every 3 seconds...
          </Typography>
          <Box sx={{ 
            mt: 1, 
            height: 8, 
            backgroundColor: '#e0e0e0', 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <Box sx={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#4caf50',
              transition: 'width 0.3s ease'
            }} />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default LocationSimulator;