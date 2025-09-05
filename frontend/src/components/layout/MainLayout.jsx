import { Box, Container, CssBaseline, useScrollTrigger } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { CartProvider } from '../../contexts/CartContext.jsx';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%)',
      }}
    >
      <CssBaseline />
      <CartProvider>
        <Navbar scrollTrigger={trigger} />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Outlet />
          </Container>
        </Box>
        <Footer />
      </CartProvider>
    </Box>
  );
};

export default MainLayout;
