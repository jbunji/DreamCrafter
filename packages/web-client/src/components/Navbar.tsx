import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { toggleSidebar, toggleSettings } from '../store/slices/uiSlice';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.profile);
  const notifications = useSelector((state: RootState) => state.ui.notifications);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => dispatch(toggleSidebar())}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          component={motion.div}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4a90e2 0%, #ff6b6b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            DreamCrafter
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            color="inherit"
            onClick={() => dispatch(toggleSettings())}
            sx={{ mr: 1 }}
          >
            <SettingsIcon />
          </IconButton>

          {user ? (
            <Box
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            >
              <Avatar
                src={user.id} // Placeholder - would use actual avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ ml: 1.5, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.username}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Level {user.level}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Button
              variant="contained"
              startIcon={<PersonIcon />}
              onClick={() => navigate('/profile')}
              sx={{
                borderRadius: 3,
                px: 3,
                background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5ba0f2 0%, #4080cd 100%)',
                },
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;