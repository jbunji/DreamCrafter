import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { SoundEffects, MusicTracks } from '@dreamcrafter/shared-types';
import { AudioManager } from '../audio/AudioManager';
import { PremiumBackgroundRenderer } from '../graphics/PremiumBackgroundRenderer';
import { gsap } from 'gsap';

export class MainMenuScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text;
  private playButton?: Phaser.GameObjects.Container;
  private settingsButton?: Phaser.GameObjects.Container;
  private leaderboardButton?: Phaser.GameObjects.Container;
  private audioManager?: AudioManager;
  private backgroundRenderer?: PremiumBackgroundRenderer;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.audioManager = new AudioManager(this);
    this.backgroundRenderer = new PremiumBackgroundRenderer(this);
    
    this.createPremiumBackground();
    this.createEnhancedTitle();
    this.createEnhancedButtons();
    this.animateEntrance();
    
    // Start main menu music
    this.audioManager.playMusic(MusicTracks.MAIN_MENU);
  }

  private createPremiumBackground(): void {
    this.backgroundRenderer?.createDynamicBackground(GAME_WIDTH, GAME_HEIGHT);
  }

  private createEnhancedTitle(): void {
    this.titleText = this.add.text(GAME_WIDTH / 2, 200, 'DREAMCRAFTER', {
      fontSize: '96px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#4a90e2',
      strokeThickness: 8,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 10,
        fill: true
      }
    }).setOrigin(0.5).setAlpha(0);

    // Add subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, 280, 'Match • Dream • Craft', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#74b9ff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    // Animated entrance for title
    gsap.to(this.titleText, {
      alpha: 1,
      y: 180,
      duration: 1.2,
      ease: "bounce.out"
    });

    gsap.to(subtitle, {
      alpha: 1,
      delay: 0.5,
      duration: 0.8,
      ease: "power2.out"
    });
  }

  private createEnhancedButtons(): void {
    this.playButton = this.createEnhancedButton(GAME_WIDTH / 2, 450, 'PLAY', 0x4a90e2, () => {
      this.startGame();
    });

    this.settingsButton = this.createEnhancedButton(GAME_WIDTH / 2, 570, 'SETTINGS', 0xff6b47, () => {
      console.log('Settings clicked');
    });

    this.leaderboardButton = this.createEnhancedButton(GAME_WIDTH / 2, 690, 'LEADERBOARD', 0x2ed573, () => {
      console.log('Leaderboard clicked');
    });
  }

  private createEnhancedButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    // Button background with gradient effect
    const bg = this.add.graphics();
    bg.fillGradientStyle(color, color, Phaser.Display.Color.ValueToColor(color).darken(20).color, Phaser.Display.Color.ValueToColor(color).darken(20).color, 1);
    bg.fillRoundedRect(-150, -35, 300, 70, 15);
    
    // Glow effect
    bg.lineStyle(4, color, 0.8);
    bg.strokeRoundedRect(-155, -40, 310, 80, 18);
    
    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setSize(300, 70);
    button.setInteractive({ useHandCursor: true });

    // Enhanced hover effects
    button.on('pointerover', () => {
      gsap.to(button, { scale: 1.05, duration: 0.2, ease: "power2.out" });
      gsap.to(bg, { alpha: 1.2, duration: 0.2 });
    });

    button.on('pointerout', () => {
      gsap.to(button, { scale: 1, duration: 0.2, ease: "power2.out" });
      gsap.to(bg, { alpha: 1, duration: 0.2 });
    });

    button.on('pointerdown', () => {
      this.audioManager?.playSound(SoundEffects.BUTTON_CLICK);
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        onComplete: callback
      });
    });

    return button;
  }

  private animateEntrance(): void {
    // Title animation
    if (this.titleText) {
      gsap.to(this.titleText, {
        alpha: 1,
        y: '-=50',
        duration: 1,
        ease: "power2.out"
      });
    }

    // Buttons animation
    const buttons = [this.playButton, this.settingsButton, this.leaderboardButton];
    buttons.forEach((button, index) => {
      if (button) {
        gsap.to(button, {
          alpha: 1,
          scale: 1,
          delay: 0.3 + index * 0.1,
          duration: 0.5,
          ease: "back.out(1.7)"
        });
      }
    });
  }

  private startGame(): void {
    // Fade out animation
    gsap.to(this.cameras.main, {
      alpha: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        this.scene.start('GameScene', { level: 1 });
      }
    });
  }
}