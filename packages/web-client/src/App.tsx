import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import MainLayout from './layouts/MainLayout';
import LoadingScreen from './components/LoadingScreen';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function App(): React.ReactElement {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={
              <Suspense fallback={<LoadingScreen />}>
                <HomePage />
              </Suspense>
            } />
            <Route path="play" element={
              <Suspense fallback={<LoadingScreen />}>
                <GamePage />
              </Suspense>
            } />
            <Route path="profile" element={
              <Suspense fallback={<LoadingScreen />}>
                <ProfilePage />
              </Suspense>
            } />
            <Route path="leaderboard" element={
              <Suspense fallback={<LoadingScreen />}>
                <LeaderboardPage />
              </Suspense>
            } />
            <Route path="settings" element={
              <Suspense fallback={<LoadingScreen />}>
                <SettingsPage />
              </Suspense>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Box>
  );
}

export default App;