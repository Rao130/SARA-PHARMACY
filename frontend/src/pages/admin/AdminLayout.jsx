import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminTopbar onMenuToggle={handleDrawerToggle} />
        <Box component="main" sx={{ flex: 1, p: 3, backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
          <Container maxWidth={false}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
