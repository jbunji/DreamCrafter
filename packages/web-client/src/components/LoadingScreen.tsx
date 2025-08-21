import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        zIndex: 9999,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ position: 'relative', width: 120, height: 120, mb: 4 }}>
          {/* Animated gem loader */}
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <motion.div
              key={index}
              style={{
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: '30%',
                background: `hsl(${index * 60}, 70%, 50%)`,
                left: '50%',
                top: '50%',
                marginLeft: -20,
                marginTop: -20,
              }}
              animate={{
                x: Math.cos((index * Math.PI) / 3) * 40,
                y: Math.sin((index * Math.PI) / 3) * 40,
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(135deg, #4a90e2 0%, #ff6b6b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600,
            mb: 2,
          }}
        >
          DreamCrafter
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Loading amazing experiences...
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;