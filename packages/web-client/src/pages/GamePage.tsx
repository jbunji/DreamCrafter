import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, Paper, Typography, Button, IconButton } from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  VolumeUp as VolumeIcon,
  VolumeOff as VolumeMuteIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { DreamCrafterGame } from '@dreamcrafter/game-engine';
import {
  startGame,
  pauseGame,
  resumeGame,
  endGame,
  setGameInstance,
  updateGameState,
} from '../store/slices/gameSlice';
import { updateStatistics } from '../store/slices/userSlice';
import { setFullscreen } from '../store/slices/uiSlice';

const GamePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<DreamCrafterGame | null>(null);
  
  const gameState = useSelector((state: RootState) => state.game);
  const user = useSelector((state: RootState) => state.user.profile);
  const preferences = useSelector((state: RootState) => state.user.preferences);
  const isFullscreen = useSelector((state: RootState) => state.ui.isFullscreen);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (gameContainerRef.current && !gameInstanceRef.current) {
      initializeGame();
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, []);

  const initializeGame = async () => {
    try {
      setIsLoading(true);

      const game = new DreamCrafterGame({
        parent: gameContainerRef.current!,
        playerProfile: user || undefined,
        onStateChange: (state) => {
          dispatch(updateGameState(state));
        },
      });

      gameInstanceRef.current = game;
      dispatch(setGameInstance(game));

      game.on('ready', () => {
        setIsLoading(false);
        dispatch(startGame({ level: 1 }));
        game.startGame(1);
      });

      game.on('gameOver', (data: any) => {
        dispatch(endGame());
        if (user) {
          dispatch(updateStatistics({
            gamesPlayed: user.statistics.gamesPlayed + 1,
            totalScore: user.statistics.totalScore + data.score,
          }));
        }
      });
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setIsLoading(false);
    }
  };

  const handlePauseResume = () => {
    if (!gameInstanceRef.current) return;

    if (gameState.isPaused) {
      gameInstanceRef.current.resumeGame();
      dispatch(resumeGame());
    } else {
      gameInstanceRef.current.pauseGame();
      dispatch(pauseGame());
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      dispatch(setFullscreen(true));
    } else {
      document.exitFullscreen();
      dispatch(setFullscreen(false));
    }
  };

  const toggleSound = () => {
    // Toggle sound in preferences
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Game Header */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Level {gameState.currentLevel}
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Score: {gameState.score.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={toggleSound}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              }}
            >
              {preferences.soundEnabled ? <VolumeIcon /> : <VolumeMuteIcon />}
            </IconButton>

            <IconButton
              onClick={handlePauseResume}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              }}
            >
              {gameState.isPaused ? <PlayIcon /> : <PauseIcon />}
            </IconButton>

            <IconButton
              onClick={toggleFullscreen}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
              }}
            >
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Game Container */}
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            backgroundColor: 'transparent',
            border: '2px solid rgba(74, 144, 226, 0.3)',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(74, 144, 226, 0.2)',
            aspectRatio: '9/16',
            maxHeight: '80vh',
            mx: 'auto',
          }}
        >
          <Box
            ref={gameContainerRef}
            id="game-container"
            className="game-container"
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />

          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <div className="loading-spinner" />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading Game...
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pause Overlay */}
          <AnimatePresence>
            {gameState.isPaused && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{ mb: 3, fontWeight: 600 }}>
                    Game Paused
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayIcon />}
                    onClick={handlePauseResume}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.2rem',
                      borderRadius: 3,
                    }}
                  >
                    Resume
                  </Button>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>

        {/* Game Tips */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Match 3 or more gems to score! Create cascades for bonus points.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default GamePage;