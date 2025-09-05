import React from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab, Divider, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
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

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const Settings = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Settings
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" {...a11yProps(0)} />
          <Tab icon={<LockIcon />} iconPosition="start" label="Security" {...a11yProps(1)} />
          <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" {...a11yProps(2)} />
        </Tabs>

        <TabPanel value={value} index={0}>
          <Typography variant="h5" gutterBottom>Profile Settings</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  id="phone"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={value} index={1}>
          <Typography variant="h5" gutterBottom>Security Settings</Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="currentPassword"
              label="Current Password"
              type="password"
              id="currentPassword"
              autoComplete="current-password"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              autoComplete="new-password"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Change Password
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={value} index={2}>
          <Typography variant="h5" gutterBottom>Notification Settings</Typography>
          <Divider sx={{ mb: 3 }} />
          <Box component="form" noValidate>
            <FormControl fullWidth margin="normal">
              <InputLabel id="email-notifications-label">Email Notifications</InputLabel>
              <Select
                labelId="email-notifications-label"
                id="email-notifications"
                label="Email Notifications"
                defaultValue="important"
              >
                <MenuItem value="all">All Notifications</MenuItem>
                <MenuItem value="important">Important Only</MenuItem>
                <MenuItem value="none">None</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="sms-notifications-label">SMS Notifications</InputLabel>
              <Select
                labelId="sms-notifications-label"
                id="sms-notifications"
                label="SMS Notifications"
                defaultValue="important"
              >
                <MenuItem value="all">All Notifications</MenuItem>
                <MenuItem value="important">Important Only</MenuItem>
                <MenuItem value="none">None</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Save Preferences
            </Button>
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default Settings;
