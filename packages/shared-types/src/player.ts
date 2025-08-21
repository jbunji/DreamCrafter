import { Purchase } from './monetization';

export interface PlayerProfile {
  id: string;
  username: string;
  level: number;
  experience: number;
  skillLevel: number;
  playStyle: PlayStyle;
  preferences: PlayerPreferences;
  performance: PlayerPerformance;
  statistics: PlayerStatistics;
  createdAt: Date;
  lastPlayedAt: Date;
}

export enum PlayStyle {
  STRATEGIC = 'strategic',
  FAST_PACED = 'fast_paced',
  COMPLETIONIST = 'completionist',
  CASUAL = 'casual',
  COMPETITIVE = 'competitive',
}

export interface PlayerPreferences {
  favoriteGemColors: string[];
  preferredPatterns: Pattern[];
  avgMovesPerTurn: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface Pattern {
  type: 'corner' | 'center' | 'edge' | 'random';
  frequency: number;
}

export interface PlayerPerformance {
  avgMovesPerLevel: number;
  avgCompletionTime: number;
  successRate: number;
  comboFrequency: number;
  powerUpUsage: number;
  perfectLevels: number;
  avgScorePerMove: number;
}

export interface PlayerStatistics {
  gamesPlayed: number;
  totalScore: number;
  highestLevel: number;
  totalTime: number;
  puzzlesShared: number;
  puzzlesPlayed: number;
  winStreak: number;
  currentStreak: number;
  totalGems: number;
  totalCoins: number;
  achievementsUnlocked: string[];
}

export interface PlayerCurrency {
  gems: number;
  coins: number;
}

export interface PlayerInventory {
  powerUps: PowerUpInventory[];
  boosters: Booster[];
  themes: string[];
  avatars: string[];
}

export interface PowerUpInventory {
  type: string;
  count: number;
}

export interface Booster {
  id: string;
  type: BoosterType;
  duration: number;
  expiresAt?: Date;
}

export enum BoosterType {
  DOUBLE_SCORE = 'double_score',
  EXTRA_MOVES = 'extra_moves',
  UNLIMITED_LIVES = 'unlimited_lives',
  RAINBOW_START = 'rainbow_start',
}

export interface PlayerSession {
  id: string;
  playerId: string;
  startTime: Date;
  endTime?: Date;
  levelsPlayed: number;
  totalScore: number;
  gemsEarned: number;
  adsWatched: number;
  purchasesMade: Purchase[];
}