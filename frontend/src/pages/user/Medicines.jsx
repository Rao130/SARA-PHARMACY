import { useEffect, useMemo, useRef, useState, memo } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  Stack, 
  CircularProgress, 
  CardMedia,
  Badge,
  Container,
  Tabs,
  Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import SymptomChecker from '../../components/SymptomChecker';
import axiosInstance from '../../api/axiosInstance';
import { useCart } from '../../contexts/CartContext.jsx';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`medicines-tabpanel-${index}`}
      aria-labelledby={`medicines-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Medicines() {
  const { addItem } = useCart();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaderReady, setLoaderReady] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const lastFetchedRef = useRef(null);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const cancelRef = useRef(null);
  const reqSeqRef = useRef(0);
  const lastSigRef = useRef('');

  // Resolve backend uploads base from API baseURL (works for absolute and relative)
  const uploadsBase = useMemo(() => {
    try {
      const u = new URL(axiosInstance.defaults.baseURL, window.location.origin);
      return `${u.origin}/uploads`;
    } catch {
      return '/uploads';
    }
  }, []);

  // Fetch offers
  const fetchOffers = async () => {
    try {
      const res = await axiosInstance.get('/announcements', {
        params: { type: 'offer', active: true },
      });
      setOffers(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  // Fetch medicines
  const fetchMedicines = async (search = '') => {
    // Cancel previous request if any
    if (cancelRef.current) {
      cancelRef.current.abort();
    }
    const controller = new AbortController();
    cancelRef.current = controller;
    const mySeq = ++reqSeqRef.current;

    // delayed loader to avoid flicker
    // Only show loader when we currently have no items (initial load or empty result)
    const shouldShowLoader = items.length === 0;
    if (shouldShowLoader) {
      setLoading(true);
      setLoaderReady(false);
    }
    const loaderTimer = setTimeout(() => {
      if (shouldShowLoader) setLoaderReady(true);
    }, 200);

    try {
      const res = await axiosInstance.get('/medicines', {
        params: search ? { search } : {},
        signal: controller.signal,
      });
      const data = res.data?.data || res.data || [];
      const arr = (Array.isArray(data) ? data : []).slice().sort((a, b) => String(a._id).localeCompare(String(b._id)));
      // Build a simple signature to avoid unnecessary re-renders
      const sig = arr
        .map((x) => `${x._id}|${x.price}|${x.stock}|${x.image || ''}`)
        .join('||');
      if (mySeq === reqSeqRef.current && sig !== lastSigRef.current) {
        setItems(arr);
        lastSigRef.current = sig;
      }
    } catch (e) {
      if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
        // only clear on real error
        if (mySeq === reqSeqRef.current) {
          // keep previous items to avoid flicker, just no-op
          lastSigRef.current = lastSigRef.current;
        }
      }
    } finally {
      if (mySeq === reqSeqRef.current) {
        clearTimeout(loaderTimer);
        if (items.length === 0) {
          setLoaderReady(false);
          setLoading(false);
        }
      }
    }
  };

  // Fetch data on mount
  useEffect(() => {
    const q = '';
    fetchMedicines(q);
    fetchOffers();
    lastFetchedRef.current = q;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    const q = query.trim();
    if (q === lastFetchedRef.current) return;
    fetchMedicines(q);
    lastFetchedRef.current = q;
  };

  const MedicineCard = memo(function MedicineCard({ 
    id, 
    name, 
    genericName, 
    strength, 
    form, 
    manufacturer, 
    price, 
    discount = 0,
    prescriptionRequired, 
    stock, 
    image, 
    uploadsBase 
  }) {
    const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
    
    const cardContent = (
      <Card>
        <CardMedia
          component="img"
          height="160"
          alt={name}
          sx={{ objectFit: 'cover' }}
          loading="lazy"
          src={(image && (image.startsWith('http') ? image : `${uploadsBase}/${image}`)) || `${uploadsBase}/no-photo.jpg`}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
        />
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h6" component="div">
              {name}
            </Typography>
            {discount > 0 && (
              <Box display="flex" flexDirection="column" alignItems="flex-end">
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  ₹{price.toFixed(2)}
                </Typography>
                <Typography variant="h6" color="error">
                  ₹{discountedPrice.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" noWrap title={genericName}>
            {genericName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {strength} • {form}
          </Typography>
          <Typography variant="body2">{manufacturer}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip size="small" label={`₹${price}`} color="primary" />
            {prescriptionRequired && <Chip size="small" label="Rx" />}
            <Chip size="small" label={`Stock: ${stock}`} />
          </Stack>
          <Button 
            sx={{ mt: 2 }} 
            variant="contained" 
            onClick={() => addItem({ _id: id, name, price, image })}
          >
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    );

    return (
      <Grid item xs={12} sm={6} md={4} key={id}>
        {discount > 0 ? (
          <Badge
            badgeContent={`${discount}% OFF`}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                top: 16,
                right: 16,
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '4px',
              },
              width: '100%',
            }}
          >
            {cardContent}
          </Badge>
        ) : (
          cardContent
        )}
      </Grid>
    );
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Our Medicines & Offers
        </Typography>
        
        {/* Search Box */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search medicines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="medicine tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Medicines" />
            <Tab label="Special Offers" icon={<LocalOfferIcon />} iconPosition="start" />
            <Tab label="Prescription Required" />
            <Tab label="OTC Medicines" />
            <Tab 
              label="Symptom Checker" 
              icon={<MedicalServicesIcon />} 
              iconPosition="start" 
              sx={{ minHeight: '48px' }}
            />
          </Tabs>
        </Box>

      {/* Keep grid mounted to reduce blinking; only show loader on first load or when no data */}
      <Box sx={{ position: 'relative' }}>
        <TabPanel value={activeTab} index={0}>
          {loading && loaderReady ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Typography variant="body1" color="textSecondary" textAlign="center" p={4}>
              No medicines found. Try a different search term.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {items.map((item) => (
                <MedicineCard
                  key={item._id}
                  id={item._id}
                  name={item.name}
                  genericName={item.genericName}
                  strength={item.strength}
                  form={item.form}
                  manufacturer={item.manufacturer}
                  price={item.price}
                  discount={item.discount}
                  prescriptionRequired={item.prescriptionRequired}
                  stock={item.stock}
                  image={item.image}
                  uploadsBase={uploadsBase}
                />
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {offers.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Special Offers
              </Typography>
              <Grid container spacing={3}>
                {items
                  .filter(item => item.discount > 0)
                  .map((item) => (
                    <MedicineCard
                      key={item._id}
                      id={item._id}
                      name={item.name}
                      genericName={item.genericName}
                      strength={item.strength}
                      form={item.form}
                      manufacturer={item.manufacturer}
                      price={item.price}
                      discount={item.discount}
                      prescriptionRequired={item.prescriptionRequired}
                      stock={item.stock}
                      image={item.image}
                      uploadsBase={uploadsBase}
                    />
                  ))}
              </Grid>
            </Box>
          ) : (
            <Typography variant="body1" color="textSecondary" textAlign="center" p={4}>
              No special offers available at the moment.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {items.filter(item => item.prescriptionRequired).length > 0 ? (
            <Grid container spacing={3}>
              {items
                .filter(item => item.prescriptionRequired)
                .map((item) => (
                  <MedicineCard
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    genericName={item.genericName}
                    strength={item.strength}
                    form={item.form}
                    manufacturer={item.manufacturer}
                    price={item.price}
                    discount={item.discount}
                    prescriptionRequired={item.prescriptionRequired}
                    stock={item.stock}
                    image={item.image}
                    uploadsBase={uploadsBase}
                  />
                ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="textSecondary" textAlign="center" p={4}>
              No prescription medicines found.
            </Typography>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          {items.filter(item => !item.prescriptionRequired).length > 0 ? (
            <Grid container spacing={3}>
              {items
                .filter(item => !item.prescriptionRequired)
                .map((item) => (
                  <MedicineCard
                    key={item._id}
                    id={item._id}
                    name={item.name}
                    genericName={item.genericName}
                    strength={item.strength}
                    form={item.form}
                    manufacturer={item.manufacturer}
                    price={item.price}
                    discount={item.discount}
                    prescriptionRequired={item.prescriptionRequired}
                    stock={item.stock}
                    image={item.image}
                    uploadsBase={uploadsBase}
                  />
                ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="textSecondary" textAlign="center" p={4}>
              No OTC medicines found.
            </Typography>
          )}
        </TabPanel>
      </Box>
      </Box>

      {/* Symptom Checker Tab */}
      <TabPanel value={activeTab} index={4}>
        <SymptomChecker />
      </TabPanel>
    </Container>
  );
}
