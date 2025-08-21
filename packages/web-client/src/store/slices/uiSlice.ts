import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UiSliceState {
  sidebarOpen: boolean;
  settingsOpen: boolean;
  notifications: Notification[];
  isFullscreen: boolean;
  showTutorial: boolean;
  activeModal: string | null;
}

const initialState: UiSliceState = {
  sidebarOpen: false,
  settingsOpen: false,
  notifications: [],
  isFullscreen: false,
  showTutorial: !localStorage.getItem('tutorialCompleted'),
  activeModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSettings(state) {
      state.settingsOpen = !state.settingsOpen;
    },
    setSettingsOpen(state, action: PayloadAction<boolean>) {
      state.settingsOpen = action.payload;
    },
    addNotification(state, action: PayloadAction<Omit<Notification, 'id'>>) {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.push(notification);
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearNotifications(state) {
      state.notifications = [];
    },
    setFullscreen(state, action: PayloadAction<boolean>) {
      state.isFullscreen = action.payload;
    },
    setShowTutorial(state, action: PayloadAction<boolean>) {
      state.showTutorial = action.payload;
      if (!action.payload) {
        localStorage.setItem('tutorialCompleted', 'true');
      }
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSettings,
  setSettingsOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setFullscreen,
  setShowTutorial,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;