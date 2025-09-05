import { Container, Typography, Box } from '@mui/material';

const AboutUs = () => (
  <Container maxWidth="md" sx={{ py: 6 }}>
    <Typography variant="h4" fontWeight={700} gutterBottom>
      About Sara Pharmacy
    </Typography>
    <Typography variant="body1" paragraph>
      Sara Pharmacy is your trusted online pharmacy, dedicated to providing quality healthcare solutions, fast delivery, and excellent customer service. We offer a wide range of prescription and OTC medicines, wellness products, and a symptom checker to help you manage your health conveniently.
    </Typography>
    <Typography variant="body1" paragraph>
      Our mission is to make healthcare accessible and affordable for everyone, with a focus on reliability and customer satisfaction.
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight={600}>
        Website Developed By:
      </Typography>
      <Typography variant="body1">
        Shweat Yadav
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Contact: sarapharmacy3212@gmail.com
      </Typography>
    </Box>
  </Container>
);

export default AboutUs;