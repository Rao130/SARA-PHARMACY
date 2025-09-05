import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalPharmacyIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                Sara Pharmacy
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your trusted online pharmacy providing quality healthcare solutions with fast delivery and excellent customer service.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/medicines" color="text.secondary" variant="body2">
                Medicines
              </Link>
              <Link component={RouterLink} to="/symptom-checker" color="text.secondary" variant="body2">
                Symptom Checker
              </Link>
              <Link component={RouterLink} to="/about" color="text.secondary" variant="body2">
                About Us
              </Link>
            </Box>
          </Grid>

          {/* Categories */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/medicines?category=prescription" color="text.secondary" variant="body2">
                Prescription
              </Link>
              <Link component={RouterLink} to="/medicines?category=otc" color="text.secondary" variant="body2">
                OTC Medicines
              </Link>
              <Link component={RouterLink} to="/medicines?category=wellness" color="text.secondary" variant="body2">
                Wellness
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  SaraPharmacy near Harjas Girls Hostel, Bidholi Dehradhun
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  UttraKhand, India
                </Typography>
              </Box>
              <Box>
                <a href="mailto:rachittyagi169@gmail.com">sarapharmacy3212@gmail.com</a>
                <br />
                <a herf="tel:+91 6395836615">📞 +91 6395836615</a>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  OPEN: 24/7
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Sara Pharmacy. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, mt: { xs: 2, sm: 0 } }}>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
