import React from 'react';
import { Container, Typography } from '@mui/material';

const LeaderboardPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4">Leaderboard</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Global rankings coming soon...
      </Typography>
    </Container>
  );
};

export default LeaderboardPage;