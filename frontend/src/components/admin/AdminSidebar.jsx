import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemIcon, 
  ListItemText, 
  Collapse,
  Divider, 
  Box, 
  Typography 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  LocalPharmacy as MedicineIcon,
  LocalOffer as OfferIcon,
  Inventory as InventoryIcon,
  ExitToApp as LogoutIcon,
  Home as HomeIcon,
  ExpandLess,
  ExpandMore,
  AddCircleOutline,
  List as ListIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Add Medicine', icon: <AddCircleOutline />, path: '/admin/add-medicine' },
  { text: 'Offers', icon: <OfferIcon />, path: '/admin/offers' },
];

const AdminSidebar = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openItems, setOpenItems] = useState({});

  const handleClick = (text) => {
    setOpenItems(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  const renderMenuItems = (items, isNested = false) => {
    return items.map((item) => {
      const hasItems = item.items && item.items.length > 0;
      const isActive = location.pathname === item.path || 
                      (hasItems && item.items.some(subItem => subItem.path === location.pathname));
      
      return (
        <React.Fragment key={item.text}>
          <ListItem 
            disablePadding 
            sx={{ 
              '& .MuiListItemButton-root': {
                pl: isNested ? 4 : 2,
              }
            }}
          >
            <ListItemButton 
              onClick={() => {
                if (hasItems) {
                  handleClick(item.text);
                } else {
                  navigate(item.path);
                }
              }}
              selected={isActive}
              sx={{
                mb: 0.5,
                borderRadius: '8px',
                color: '#ffffff',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(102, 126, 234, 0.2)',
                  borderLeft: '3px solid #667eea',
                },
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: '#667eea' }}>
                {item.icon || (isNested ? <ListIcon fontSize="small" sx={{ color: '#667eea' }} /> : null)}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {hasItems && (openItems[item.text] ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
          </ListItem>
          
          {hasItems && (
            <Collapse in={openItems[item.text]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderMenuItems(item.items.map(subItem => ({
                  ...subItem,
                  icon: <AddCircleOutline fontSize="small" />
                })), true)}
              </List>
            </Collapse>
          )}
        </React.Fragment>
      );
    });
  };

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      backgroundColor: '#1a1a2e',
      color: '#ffffff',
      boxShadow: '0 0 20px rgba(0,0,0,0.5)',
      borderRight: '1px solid rgba(255,255,255,0.1)',
    }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea', mb: 0.5 }}>
          SARA PHARMA
        </Typography>
        <Typography variant="body2" sx={{ color: '#b0b0b0', fontSize: '0.8rem' }}>
          Admin Panel
        </Typography>
      </Box>
      <Divider />
      <List>
        {renderMenuItems(menuItems)}
      </List>
      
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigate('/')}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: '#667eea' }}>
                <HomeIcon sx={{ color: '#667eea' }} />
              </ListItemIcon>
              <ListItemText primary="Back to Site" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => {
                // Handle logout
                navigate('/login');
              }}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: '#667eea' }}>
                <LogoutIcon sx={{ color: '#667eea' }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: '#1a1a2e',
            borderRight: '1px solid rgba(255,255,255,0.1)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: '#1a1a2e',
            borderRight: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;
