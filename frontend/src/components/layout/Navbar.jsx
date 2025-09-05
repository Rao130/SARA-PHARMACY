import { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Typography,
  Slide,
  useScrollTrigger,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart,
  Person,
  Settings,
  Logout,
  LocalPharmacy,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext.jsx';

const Navbar = ({ scrollTrigger }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { totalQuantity } = useCart() || { totalQuantity: 0 };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Medicines', path: '/medicines' },
    { title: 'Symptom Checker', path: '/symptom-checker' },
    ...(currentUser?.role === 'admin' ? [
      { 
        title: 'Add Medicine', 
        path: '/admin/add-medicine',
        protected: true 
      }
    ] : []),
  ];

  return (
    <Slide appear={false} direction="down" in={!scrollTrigger}>
      <AppBar
        elevation={scrolled ? 4 : 0}
        sx={{
          background: scrolled
            ? 'rgba(255, 255, 255, 0.95)'
            : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
          py: scrolled ? 0 : 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                mr: 4,
              }}
            >
              <LocalPharmacy
                sx={{
                  color: scrolled ? 'primary.main' : 'white',
                  fontSize: 32,
                  mr: 1,
                }}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: scrolled ? 'primary.main' : 'white',
                  display: { xs: 'none', md: 'block' },
                }}
              >
                Sara Pharmacy
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  onClick={(e) => {
                    if (link.protected && !currentUser) {
                      e.preventDefault();
                      navigate('/login', { 
                        state: { from: link.path },
                        replace: true 
                      });
                    }
                  }}
                  sx={{
                    my: 2,
                    color: scrolled ? 'text.primary' : 'white',
                    display: 'block',
                    mx: 1,
                    fontWeight: location.pathname === link.path ? 600 : 400,
                    position: 'relative',
                    '&:hover': {
                      color: scrolled ? 'primary.main' : 'white',
                      '&::after': {
                        width: '100%',
                        opacity: 1,
                      },
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 8,
                      left: 0,
                      width: location.pathname === link.path ? '100%' : '0%',
                      height: '2px',
                      backgroundColor: scrolled ? 'primary.main' : 'white',
                      transition: 'all 0.3s ease',
                      opacity: location.pathname === link.path ? 1 : 0,
                    },
                  }}
                >
                  {link.title}
                </Button>
              ))}
            </Box>

            {/* Right Side Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="large"
                color="inherit"
                component={RouterLink}
                to="/cart"
                onClick={(e) => {
                  if (!currentUser) {
                    e.preventDefault();
                    navigate('/login', { 
                      state: { from: '/cart' },
                      replace: true 
                    });
                  }
                }}
                sx={{
                  color: scrolled ? 'text.primary' : 'white',
                  mr: 1,
                  '&:hover': {
                    backgroundColor: scrolled
                      ? 'rgba(0, 0, 0, 0.04)'
                      : 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Badge badgeContent={currentUser ? totalQuantity : 0} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {currentUser ? (
                <>
                  <IconButton
                    onClick={handleMenu}
                    size="small"
                    sx={{ ml: 1 }}
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                  >
                    <Avatar
                      alt={currentUser.name || 'User'}
                      src={currentUser.avatar}
                      sx={{
                        width: 36,
                        height: 36,
                        border: `2px solid ${scrolled ? '#4f46e5' : 'white'}`,
                      }}
                    />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {currentUser.name || 'User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentUser.email}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                      component={RouterLink}
                      to="/profile"
                      onClick={handleClose}
                    >
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem
                      component={RouterLink}
                      to="/settings"
                      onClick={handleClose}
                    >
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={logout}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={RouterLink}
                  to="/login"
                  variant={scrolled ? 'contained' : 'outlined'}
                  color={scrolled ? 'primary' : 'inherit'}
                  sx={{
                    ml: 2,
                    color: scrolled ? 'white' : 'white',
                    borderColor: scrolled ? 'primary.main' : 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: scrolled ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu Button */}
              <IconButton
                size="large"
                color="inherit"
                aria-label="menu"
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  ml: 1,
                  color: scrolled ? 'text.primary' : 'white',
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Slide>
  );
};

export default Navbar;
