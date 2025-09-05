import React from 'react';
import { Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Box 
      component={Link} 
      to="/" 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: 'inherit'
      }}
    >
      <Box
        component="img"
        src="/logo.png"
        alt="Sara Pharmacy"
        sx={{
          height: 40,
          width: 40,
          mr: 1,
        }}
      />
      <Typography
        variant="h6"
        noWrap
        sx={{
          fontWeight: 700,
          letterSpacing: '.2rem',
          color: 'primary.main',
          textDecoration: 'none',
        }}
      >
        SARA
      </Typography>
    </Box>
  );
};

export default Logo;
