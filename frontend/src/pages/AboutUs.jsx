import { Container, Typography, Box, Grid, Paper, Chip, Divider } from '@mui/material';
import { LocalPharmacy, Security, Speed, SupportAgent, Code, Person } from '@mui/icons-material';

const AboutUs = () => (
  <Container maxWidth="lg" sx={{ py: 6 }}>
    {/* Header Section */}
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom sx={{ color: '#1976d2' }}>
        About Sara Pharmacy
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
        Your Modern Digital Healthcare Partner - Bridging Technology and Healthcare for a Better Tomorrow
      </Typography>
    </Box>

    {/* Main Content */}
    <Grid container spacing={4}>
      {/* Company Overview */}
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LocalPharmacy sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
            <Typography variant="h4" fontWeight={600} sx={{ color: '#1976d2' }}>
              Our Story
            </Typography>
          </Box>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            Sara Pharmacy is a cutting-edge digital healthcare platform that revolutionizes the way people access medicines and healthcare services. Founded with the vision of making quality healthcare accessible to everyone, we combine modern technology with trusted pharmaceutical services to deliver an exceptional user experience.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            Our platform serves as a comprehensive healthcare ecosystem where customers can browse through an extensive catalog of prescription and over-the-counter medicines, utilize our intelligent symptom checker, and enjoy seamless order management with real-time tracking capabilities.
          </Typography>
        </Paper>
      </Grid>

      {/* Key Features */}
      <Grid item xs={12}>
        <Typography variant="h4" fontWeight={600} gutterBottom sx={{ color: '#1976d2', mb: 3 }}>
          What Makes Us Special
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Security sx={{ fontSize: 30, color: '#4caf50', mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Secure & Reliable Platform
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Built with enterprise-grade security, JWT authentication, and encrypted data transmission to ensure your personal and medical information stays protected.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <Speed sx={{ fontSize: 30, color: '#ff9800', mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Real-time Order Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced WebSocket technology provides instant updates on your order status, from confirmation to delivery, keeping you informed every step of the way.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <SupportAgent sx={{ fontSize: 30, color: '#9c27b0', mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Intelligent Symptom Checker
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-powered symptom analysis helps users understand their health concerns and provides guidance on appropriate medications and treatments.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
              <LocalPharmacy sx={{ fontSize: 30, color: '#1976d2', mr: 2, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Comprehensive Medicine Catalog
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Extensive inventory management system with detailed medicine information, stock tracking, and automated low-stock alerts for seamless operations.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Grid>

      {/* Mission & Vision */}
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 4, height: '100%', backgroundColor: '#e3f2fd' }}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#1976d2' }}>
            Our Mission
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            To democratize healthcare access by leveraging cutting-edge technology, ensuring that quality medicines and healthcare services are just a click away for everyone, regardless of their location or background.
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={2} sx={{ p: 4, height: '100%', backgroundColor: '#f3e5f5' }}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#9c27b0' }}>
            Our Vision
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            To become the leading digital healthcare platform that seamlessly integrates technology with pharmaceutical services, creating a future where healthcare is accessible, affordable, and efficient for all.
          </Typography>
        </Paper>
      </Grid>

      {/* Development Team */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Code sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h4" fontWeight={600}>
              Meet The Developer
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                <Person sx={{ fontSize: 40, mr: 2 }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight={700}>
                    Shweat Yadav
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
                    (Also known as Raosahabji)
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.2rem', opacity: 0.9, textAlign: 'center', mb: 3 }}>
                Solo Full-Stack Developer & Complete System Architect. Single-handedly created this comprehensive healthcare platform using modern web technologies. Specialized in MERN stack development, real-time applications, and scalable system design - bringing the entire Sara Pharmacy vision to life.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 3 }}>
                <Chip label="Solo Developer" sx={{ mr: 1, mb: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }} />
                <Chip label="Full-Stack Expert" sx={{ mr: 1, mb: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="React.js Specialist" sx={{ mr: 1, mb: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="Node.js Expert" sx={{ mr: 1, mb: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="MERN Stack" sx={{ mr: 1, mb: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                <Chip label="System Architect" sx={{ mr: 1, mb: 1, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Sole Developer & Project Creator
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color: '#FFD700', mb: 2 }}>
              Shweat Yadav (Raosahabji)
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 2, fontSize: '1.1rem' }}>
              For technical inquiries, business partnerships, or project collaboration:
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ mt: 1 }}>
              📧 sarapharmacy3212@gmail.com
            </Typography>
            <Typography variant="body2" sx={{ mt: 3, opacity: 0.8, maxWidth: '600px', mx: 'auto' }}>
              Passionate about creating innovative healthcare solutions and always excited to discuss new opportunities for collaboration on cutting-edge web applications.
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  </Container>
);

export default AboutUs;