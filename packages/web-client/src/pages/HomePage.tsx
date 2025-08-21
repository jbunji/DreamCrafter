import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  EmojiEvents as TrophyIcon,
  Psychology as BrainIcon,
  Palette as PaletteIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const features = [
  {
    icon: BrainIcon,
    title: 'AI-Powered Puzzles',
    description: 'Dynamic difficulty that adapts to your skill level in real-time',
    color: '#4a90e2',
  },
  {
    icon: PaletteIcon,
    title: 'Stunning Graphics',
    description: 'Premium visuals with smooth animations and particle effects',
    color: '#ff6b6b',
  },
  {
    icon: SpeedIcon,
    title: 'Fast & Smooth',
    description: '60 FPS gameplay with instant response and zero lag',
    color: '#4caf50',
  },
  {
    icon: GroupIcon,
    title: 'Social Features',
    description: 'Share puzzles and compete with friends on leaderboards',
    color: '#ffb74d',
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.profile);
  const highScore = useSelector((state: RootState) => state.game.highScore);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          textAlign: 'center',
          mb: 8,
          mt: 4,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '3rem', md: '4rem' },
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #4a90e2 0%, #ff6b6b 50%, #4caf50 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% auto',
            animation: 'gradient 3s ease infinite',
            '@keyframes gradient': {
              '0%': { backgroundPosition: '0% center' },
              '50%': { backgroundPosition: '100% center' },
              '100%': { backgroundPosition: '0% center' },
            },
          }}
        >
          DreamCrafter
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: 'text.secondary',
            mb: 4,
            fontWeight: 300,
          }}
        >
          AI-Powered Match-3 Adventure
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayIcon />}
            onClick={() => navigate('/play')}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.2rem',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
              boxShadow: '0 8px 32px rgba(74, 144, 226, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5ba0f2 0%, #4080cd 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(74, 144, 226, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Play Now
          </Button>

          {highScore > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 3,
                py: 1.5,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <TrophyIcon sx={{ color: '#ffd700', mr: 1 }} />
              <Typography variant="h6">
                High Score: {highScore.toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: `1px solid ${feature.color}`,
                      boxShadow: `0 8px 32px ${feature.color}33`,
                    },
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${feature.color}22 0%, ${feature.color}11 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <Icon sx={{ fontSize: 40, color: feature.color }} />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Stats Section */}
      {user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              p: 3,
            }}
          >
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Your Progress
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#4a90e2' }}>
                    {user.level}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Current Level
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ff6b6b' }}>
                    {user.statistics.gamesPlayed}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Games Played
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                    {Math.round(user.performance.successRate * 100)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Win Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ffb74d' }}>
                    {user.statistics.currentStreak}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Win Streak
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </motion.div>
      )}
    </Container>
  );
};

export default HomePage;