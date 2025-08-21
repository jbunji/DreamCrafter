import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PlayerProfile, PlayerStatistics } from '@dreamcrafter/shared-types';

interface UserSliceState {
  isAuthenticated: boolean;
  profile: PlayerProfile | null;
  preferences: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    hapticEnabled: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  isLoading: boolean;
  error: string | null;
}

const defaultPreferences = {
  soundEnabled: true,
  musicEnabled: true,
  hapticEnabled: true,
  theme: 'dark' as const,
};

const initialState: UserSliceState = {
  isAuthenticated: false,
  profile: null,
  preferences: {
    ...defaultPreferences,
    ...JSON.parse(localStorage.getItem('preferences') || '{}'),
  },
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<PlayerProfile>) {
      state.profile = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateProfile(state, action: PayloadAction<Partial<PlayerProfile>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    updateStatistics(state, action: PayloadAction<Partial<PlayerStatistics>>) {
      if (state.profile) {
        state.profile.statistics = { ...state.profile.statistics, ...action.payload };
      }
    },
    updatePreferences(state, action: PayloadAction<Partial<UserSliceState['preferences']>>) {
      state.preferences = { ...state.preferences, ...action.payload };
      localStorage.setItem('preferences', JSON.stringify(state.preferences));
    },
    logout(state) {
      state.isAuthenticated = false;
      state.profile = null;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  updateStatistics,
  updatePreferences,
  logout,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;