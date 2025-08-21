import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  PlayArrow as PlayIcon,
  Leaderboard as LeaderboardIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { motion } from 'framer-motion';

const menuItems = [
  { text: 'Home', icon: HomeIcon, path: '/' },
  { text: 'Play', icon: PlayIcon, path: '/play' },
  { text: 'Leaderboard', icon: LeaderboardIcon, path: '/leaderboard' },
  { text: 'Profile', icon: ProfileIcon, path: '/profile' },
  { text: 'Settings', icon: SettingsIcon, path: '/settings' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const user = useSelector((state: RootState) => state.user.profile);

  const drawerWidth = sidebarOpen ? 240 : 64;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: 64, // Below navbar
          height: 'calc(100% - 64px)',
          transition: 'width 0.3s ease',
          backgroundColor: 'rgba(26, 26, 46, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          overflowX: 'hidden',
        },
      }}
    >
      {user && sidebarOpen && (
        <Box sx={{ p: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.1) 0%, rgba(255, 107, 107, 0.1) 100%)',
                borderRadius: 2,
                p: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StarIcon sx={{ color: '#ffd700', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.statistics.totalScore.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Total Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TrophyIcon sx={{ color: '#ff6b6b', mr: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.statistics.winStreak} Win Streak
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      )}

      <List>
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ListItem disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 0.5,
                    backgroundColor: isActive ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid #4a90e2' : '3px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(74, 144, 226, 0.05)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: sidebarOpen ? 40 : 56,
                      color: isActive ? '#4a90e2' : 'text.secondary',
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  {sidebarOpen && (
                    <ListItemText
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? '#4a90e2' : 'text.primary',
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </motion.div>
          );
        })}
      </List>

      {sidebarOpen && (
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
          <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            DreamCrafter v1.0.0
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
            © 2024 DreamCrafter
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;