import React from 'react';
import { Container, Typography } from '@mui/material';

const ProfilePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4">Profile Page</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Profile management coming soon...
      </Typography>
    </Container>
  );
};

export default ProfilePage;