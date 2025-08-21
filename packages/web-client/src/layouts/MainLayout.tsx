import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const MainLayout: React.FC = () => {
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <Sidebar />
      
      <Box
        component={motion.main}
        sx={{
          flexGrow: 1,
          pt: 8, // Space for navbar
          pl: { xs: 0, md: sidebarOpen ? '240px' : '64px' },
          transition: 'padding-left 0.3s ease',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;