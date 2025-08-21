import React from 'react';
import { Container, Typography } from '@mui/material';

const SettingsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4">Settings</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Game settings coming soon...
      </Typography>
    </Container>
  );
};

export default SettingsPage;