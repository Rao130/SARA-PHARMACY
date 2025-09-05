import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SearchIcon from '@mui/icons-material/Search';
import SymptomChecker from '../../components/SymptomChecker';

const SymptomCheckerPage = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 2,
            mb: 3
          }}>
            <Box sx={{
              backgroundColor: 'primary.main',
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 3
            }}>
              <MedicalServicesIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          </Box>
          
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Symptom Checker
          </Typography>
          
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontWeight: 'medium',
              fontSize: { xs: '1.1rem', md: '1.3rem' }
            }}
          >
            Find the right medicines for your symptoms
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: 700, 
              mx: 'auto',
              fontSize: { xs: '0.9rem', md: '1rem' },
              lineHeight: 1.6
            }}
          >
            Enter your symptoms below and we'll help you find relevant medicines. 
            Always consult with a healthcare professional before taking any medication.
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <SearchIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Smart Search
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Search medicines by symptoms, conditions, or keywords
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <MedicalServicesIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Expert Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get relevant medicines based on your symptoms
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <SearchIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Instant results with relevance scoring
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Symptom Checker Component */}
        <SymptomChecker />
      </Container>
    </Box>
  );
};

export default SymptomCheckerPage;
