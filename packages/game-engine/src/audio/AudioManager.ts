import * as Phaser from 'phaser';
import { gsap } from 'gsap';
import { MusicTracks } from '@dreamcrafter/shared-types';
import type { 
  AudioConfig, 
  SoundEffect, 
  MusicTrack, 
  AudioManager as IAudioManager,
  SoundEffects
} from '@dreamcrafter/shared-types';

export class AudioManager implements IAudioManager {
  private scene: Phaser.Scene;
  private config: AudioConfig;
  private currentMusic?: Phaser.Sound.BaseSound;
  private soundCache: Map<string, Phaser.Sound.BaseSound> = new Map();
  private musicCache: Map<string, Phaser.Sound.BaseSound> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.config = this.loadConfig();
    this.initializeAudio();
  }

  private loadConfig(): AudioConfig {
    const saved = localStorage.getItem('dreamcrafter_audio_config');
    return saved ? JSON.parse(saved) : {
      masterVolume: 0.7,
      musicVolume: 0.8,
      sfxVolume: 0.9,
      musicEnabled: true,
      sfxEnabled: true,
    };
  }

  private saveConfig(): void {
    localStorage.setItem('dreamcrafter_audio_config', JSON.stringify(this.config));
  }

  private initializeAudio(): void {
    // Set global volume
    this.scene.sound.volume = this.config.masterVolume;
  }

  public playSound(effect: SoundEffects, config?: Partial<SoundEffect>): void {
    if (!this.config.sfxEnabled) return;

    const soundConfig: SoundEffect = {
      key: effect,
      volume: this.config.sfxVolume,
      loop: false,
      rate: 1,
      delay: 0,
      ...config,
    };

    try {
      // Check if sound exists in cache
      let sound = this.soundCache.get(effect);
      
      if (!sound) {
        // Create new sound if it doesn't exist
        sound = this.scene.sound.add(effect, {
          volume: soundConfig.volume,
          loop: soundConfig.loop,
          rate: soundConfig.rate,
        });
        this.soundCache.set(effect, sound);
      } else {
        // Update existing sound config
        if ('setVolume' in sound) {
          (sound as any).setVolume(soundConfig.volume || this.config.sfxVolume);
        }
        if ('setRate' in sound) {
          (sound as any).setRate(soundConfig.rate || 1);
        }
      }

      if (soundConfig.delay && soundConfig.delay > 0) {
        this.scene.time.delayedCall(soundConfig.delay * 1000, () => {
          sound!.play();
        });
      } else {
        sound.play();
      }
    } catch (error) {
      console.warn(`Failed to play sound effect: ${effect}`, error);
    }
  }

  public playMusic(track: MusicTracks, config?: Partial<MusicTrack>): void {
    if (!this.config.musicEnabled) return;

    const musicConfig: MusicTrack = {
      key: track,
      volume: this.config.musicVolume,
      loop: true,
      fadeIn: 1,
      fadeOut: 1,
      ...config,
    };

    try {
      // Stop current music if playing
      if (this.currentMusic && this.currentMusic.isPlaying) {
        this.stopMusic(musicConfig.fadeOut);
      }

      // Get or create music
      let music = this.musicCache.get(track);
      
      if (!music) {
        music = this.scene.sound.add(track, {
          volume: 0, // Start at 0 for fade in
          loop: musicConfig.loop,
        });
        this.musicCache.set(track, music);
      }

      this.currentMusic = music;

      // Play with fade in
      music.play();
      
      if (musicConfig.fadeIn && musicConfig.fadeIn > 0) {
        gsap.to(music, {
          volume: musicConfig.volume,
          duration: musicConfig.fadeIn,
          ease: "power2.inOut"
        });
      } else {
        if ('setVolume' in music) {
          (music as any).setVolume(musicConfig.volume);
        }
      }
    } catch (error) {
      console.warn(`Failed to play music track: ${track}`, error);
    }
  }

  public stopMusic(fadeOut: number = 1): void {
    if (!this.currentMusic) return;

    if (fadeOut > 0) {
      gsap.to(this.currentMusic, {
        volume: 0,
        duration: fadeOut,
        ease: "power2.inOut",
        onComplete: () => {
          this.currentMusic?.stop();
          this.currentMusic = undefined;
        }
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic = undefined;
    }
  }

  public setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    this.scene.sound.volume = this.config.masterVolume;
    this.saveConfig();
  }

  public setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic && 'setVolume' in this.currentMusic) {
      (this.currentMusic as any).setVolume(this.config.musicVolume);
    }
    this.saveConfig();
  }

  public setSfxVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveConfig();
  }

  public toggleMusic(): void {
    this.config.musicEnabled = !this.config.musicEnabled;
    
    if (!this.config.musicEnabled && this.currentMusic) {
      this.stopMusic(0.5);
    }
    
    this.saveConfig();
  }

  public toggleSfx(): void {
    this.config.sfxEnabled = !this.config.sfxEnabled;
    this.saveConfig();
  }

  public updateConfig(newConfig: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeAudio();
    this.saveConfig();
  }

  public getConfig(): AudioConfig {
    return { ...this.config };
  }

  public destroy(): void {
    this.stopMusic(0);
    
    // Clear all cached sounds
    this.soundCache.forEach(sound => {
      if (sound.isPlaying) {
        sound.stop();
      }
      sound.destroy();
    });
    
    this.musicCache.forEach(music => {
      if (music.isPlaying) {
        music.stop();
      }
      music.destroy();
    });

    this.soundCache.clear();
    this.musicCache.clear();
  }

  // Adaptive music methods
  public adaptMusicToGameState(intensity: number): void {
    // Intensity: 0 = calm, 1 = intense
    const targetTrack = intensity > 0.6 ? MusicTracks.GAMEPLAY_INTENSE : MusicTracks.GAMEPLAY_CALM;
    
    if (this.currentMusic && this.currentMusic.key !== targetTrack) {
      this.playMusic(targetTrack, { fadeIn: 2, fadeOut: 2 });
    }
  }

  public calculateGameIntensity(movesLeft: number, totalMoves: number, cascadeCount: number): number {
    const moveProgress = 1 - (movesLeft / totalMoves);
    const cascadeIntensity = Math.min(cascadeCount / 3, 1);
    
    return Math.min(moveProgress * 0.7 + cascadeIntensity * 0.3, 1);
  }
}