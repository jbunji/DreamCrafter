import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { GameState, PlayerProfile } from '@dreamcrafter/shared-types';

interface GameSliceState {
  gameInstance: any | null;
  gameState: GameState | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentLevel: number;
  score: number;
  highScore: number;
}

const initialState: GameSliceState = {
  gameInstance: null,
  gameState: null,
  isPlaying: false,
  isPaused: false,
  currentLevel: 1,
  score: 0,
  highScore: parseInt(localStorage.getItem('highScore') || '0'),
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameInstance(state, action: PayloadAction<any>) {
      state.gameInstance = action.payload;
    },
    updateGameState(state, action: PayloadAction<GameState>) {
      state.gameState = action.payload;
      state.score = action.payload.score;
      state.currentLevel = action.payload.level;
    },
    startGame(state, action: PayloadAction<{ level: number }>) {
      state.isPlaying = true;
      state.isPaused = false;
      state.currentLevel = action.payload.level;
      state.score = 0;
    },
    pauseGame(state) {
      state.isPaused = true;
    },
    resumeGame(state) {
      state.isPaused = false;
    },
    endGame(state) {
      state.isPlaying = false;
      state.isPaused = false;
      
      // Update high score
      if (state.score > state.highScore) {
        state.highScore = state.score;
        localStorage.setItem('highScore', state.score.toString());
      }
    },
    updateScore(state, action: PayloadAction<number>) {
      state.score = action.payload;
    },
    updateLevel(state, action: PayloadAction<number>) {
      state.currentLevel = action.payload;
    },
  },
});

export const {
  setGameInstance,
  updateGameState,
  startGame,
  pauseGame,
  resumeGame,
  endGame,
  updateScore,
  updateLevel,
} = gameSlice.actions;

export default gameSlice.reducer;