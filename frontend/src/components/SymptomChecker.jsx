import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress, 
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  Grid,
  Tooltip,
  IconButton,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

// Common symptoms suggestions with categories
const COMMON_SYMPTOMS = {
  'Pain & Fever': ['headache', 'fever', 'toothache', 'back pain', 'muscle pain', 'joint pain'],
  'Respiratory': ['cough', 'cold', 'sore throat', 'runny nose', 'sneezing', 'congestion'],
  'Digestive': ['stomach pain', 'nausea', 'indigestion', 'heartburn', 'diarrhea', 'constipation'],
  'Allergies': ['allergy', 'hives', 'itching', 'skin rash', 'hay fever'],
  'General': ['fatigue', 'dizziness', 'body ache', 'insomnia', 'anxiety']
};

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSymptomSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSymptomClick = (symptom) => {
    setSymptoms(prev => prev ? `${prev}, ${symptom}` : symptom);
  };

  const handleCheckSymptoms = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await axiosInstance.post('/medicines/search-by-symptoms', { 
        symptoms: symptoms.trim() 
      });
      
      setResults(response.data.data || response.data);
      
      // Update recent searches
      const searchTerm = symptoms.trim();
      const updatedSearches = [
        searchTerm,
        ...recentSearches.filter(term => term !== searchTerm).slice(0, 4)
      ];
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSymptomSearches', JSON.stringify(updatedSearches));
      
    } catch (err) {
      console.error('Error searching medicines:', err);
      const errorMessage = err.response?.data?.message || 'Failed to search for medicines. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelevanceColor = (score) => {
    if (score >= 15) return 'success';
    if (score >= 8) return 'warning';
    return 'default';
  };

  const getRelevanceText = (score) => {
    if (score >= 15) return 'High Match';
    if (score >= 8) return 'Good Match';
    return 'Low Match';
  };

  return (
    <Paper 
      elevation={4} 
      sx={{ 
        p: 4, 
        mb: 4,
        borderRadius: 3,
        background: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >
      <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3, fontSize: '1rem' }}>
        Enter your symptoms to find relevant medicines. Separate multiple symptoms with commas.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'flex-start' }}>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="e.g., headache, fever, cough"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCheckSymptoms()}
            disabled={isLoading}
            multiline
            maxRows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1rem',
                '&:hover': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  }
                }
              }
            }}
          />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1rem' }}>
              Common symptoms by category:
            </Typography>
            {Object.entries(COMMON_SYMPTOMS).map(([category, symptomList]) => (
              <Accordion key={category} sx={{ mb: 2, '&:before': { display: 'none' }, borderRadius: 2 }}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                    borderRadius: 2,
                    '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.12)' },
                    '&.Mui-expanded': {
                      backgroundColor: 'rgba(25, 118, 210, 0.12)',
                      borderRadius: '8px 8px 0 0'
                    }
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {category}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {symptomList.map((symptom) => (
                      <Chip 
                        key={symptom}
                        label={symptom}
                        size="medium"
                        onClick={() => handleSymptomClick(symptom)}
                        variant="outlined"
                        sx={{ 
                          cursor: 'pointer',
                          fontWeight: 'medium',
                          '&:hover': { 
                            backgroundColor: 'primary.main',
                            color: 'white',
                            transform: 'scale(1.05)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
          
          {recentSearches.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1rem' }}>
                Recent searches:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {recentSearches.map((search, index) => (
                  <Chip 
                    key={index}
                    label={search}
                    size="medium"
                    onClick={() => setSymptoms(search)}
                    variant="outlined"
                    color="primary"
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 'medium',
                      '&:hover': { 
                        backgroundColor: 'primary.main',
                        color: 'white',
                        transform: 'scale(1.05)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
        
        <Button
          variant="contained"
          onClick={handleCheckSymptoms}
          disabled={isLoading || !symptoms.trim()}
          sx={{ 
            minWidth: 140, 
            height: 'fit-content',
            px: 4,
            py: 2,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)',
              background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)'
            },
            '&:disabled': {
              background: '#ccc',
              transform: 'none',
              boxShadow: 1
            }
          }}
          size="large"
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Search Medicines'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            {results.length > 0 
              ? `Found ${results.length} medicine(s) for "${symptoms}"`
              : 'No medicines found matching your symptoms'}
          </Typography>
          
          {results.length > 0 ? (
            <Grid container spacing={3}>
              {results.map((medicine) => (
                <Grid item xs={12} sm={6} md={4} key={medicine._id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      border: '2px solid transparent',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {medicine.name}
                        </Typography>
                        {medicine.relevanceScore && (
                          <Badge 
                            badgeContent={getRelevanceText(medicine.relevanceScore)} 
                            color={getRelevanceColor(medicine.relevanceScore)}
                            sx={{ 
                              '& .MuiBadge-badge': { 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold',
                                minWidth: '60px',
                                height: '20px'
                              } 
                            }}
                          />
                        )}
                      </Box>
                      
                      {medicine.genericName && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {medicine.genericName}
                        </Typography>
                      )}
                      
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Chip 
                          label={`₹${medicine.price?.toFixed(2) || 'Price not available'}`} 
                          color="primary" 
                          size="medium" 
                          variant="outlined"
                          sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                        />
                        {medicine.form && (
                          <Chip 
                            label={medicine.form}
                            size="medium"
                            sx={{ ml: 1, fontWeight: 'bold', fontSize: '0.9rem' }}
                            variant="outlined"
                          />
                        )}
                        {medicine.prescriptionRequired && (
                          <Chip 
                            label="Prescription Required"
                            size="medium"
                            color="warning"
                            sx={{ ml: 1, fontWeight: 'bold', fontSize: '0.9rem' }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                      
                      {medicine.strength && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          <strong>Strength:</strong> {medicine.strength}
                        </Typography>
                      )}
                      
                      {medicine.symptoms && medicine.symptoms.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Treats:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {medicine.symptoms.slice(0, 3).map((symptom, index) => (
                              <Chip 
                                key={index}
                                label={symptom}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ fontWeight: 'medium' }}
                              />
                            ))}
                            {medicine.symptoms.length > 3 && (
                              <Chip 
                                label={`+${medicine.symptoms.length - 3} more`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ fontWeight: 'medium' }}
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                      
                      {medicine.manufacturer && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          By {medicine.manufacturer}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="text.secondary" paragraph sx={{ fontWeight: 'bold', mb: 2 }}>
                No medicines found matching your symptoms
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                Try different keywords or consult a healthcare professional for advice.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => setSymptoms('')}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Clear search
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default SymptomChecker;
