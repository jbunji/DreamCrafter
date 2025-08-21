export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export interface SoundEffect {
  key: string;
  volume?: number;
  loop?: boolean;
  rate?: number;
  delay?: number;
}

export interface MusicTrack {
  key: string;
  volume?: number;
  loop: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

export enum SoundEffects {
  GEM_CLICK = 'gem_click',
  GEM_SWAP = 'gem_swap',
  GEM_MATCH = 'gem_match',
  GEM_FALL = 'gem_fall',
  CASCADE = 'cascade',
  POWER_UP_CREATE = 'power_up_create',
  POWER_UP_ACTIVATE = 'power_up_activate',
  LEVEL_COMPLETE = 'level_complete',
  GAME_OVER = 'game_over',
  BUTTON_CLICK = 'button_click',
  ACHIEVEMENT = 'achievement',
  COIN_COLLECT = 'coin_collect',
}

export enum MusicTracks {
  MAIN_MENU = 'music_main_menu',
  GAMEPLAY_CALM = 'music_gameplay_calm',
  GAMEPLAY_INTENSE = 'music_gameplay_intense',
  VICTORY = 'music_victory',
  GAME_OVER = 'music_game_over',
}

export interface AudioManager {
  playSound(effect: SoundEffects, config?: Partial<SoundEffect>): void;
  playMusic(track: MusicTracks, config?: Partial<MusicTrack>): void;
  stopMusic(fadeOut?: number): void;
  setMasterVolume(volume: number): void;
  setMusicVolume(volume: number): void;
  setSfxVolume(volume: number): void;
  toggleMusic(): void;
  toggleSfx(): void;
  updateConfig(config: Partial<AudioConfig>): void;
  getConfig(): AudioConfig;
}