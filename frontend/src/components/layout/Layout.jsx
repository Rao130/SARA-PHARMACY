import React from 'react';
import { Container, Box, CssBaseline, Toolbar, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Topbar />

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Toolbar /> {/* This pushes content below the app bar */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>

      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[200],
          textAlign: 'center',
          width: '100%'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {' '}
            {new Date().getFullYear()} Sara Pharmacy. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}