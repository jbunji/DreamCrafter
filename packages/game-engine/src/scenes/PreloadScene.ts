import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { SimpleSoundGenerator } from '../audio/SimpleSoundGenerator';

export class PreloadScene extends Phaser.Scene {
  private progressBar?: Phaser.GameObjects.Graphics;
  private progressBox?: Phaser.GameObjects.Graphics;
  private loadingText?: Phaser.GameObjects.Text;
  private percentText?: Phaser.GameObjects.Text;
  private assetText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingScreen();
    this.loadAssets();
  }

  private createLoadingScreen(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // Progress box
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRoundedRect(centerX - 320, centerY - 30, 640, 60, 15);

    // Progress bar
    this.progressBar = this.add.graphics();

    // Loading text
    this.loadingText = this.add.text(centerX, centerY - 80, 'Loading DreamCrafter...', {
      font: '32px Arial',
      color: '#ffffff'
    });
    this.loadingText.setOrigin(0.5);

    // Percent text
    this.percentText = this.add.text(centerX, centerY, '0%', {
      font: '24px Arial',
      color: '#ffffff'
    });
    this.percentText.setOrigin(0.5);

    // Asset text
    this.assetText = this.add.text(centerX, centerY + 60, '', {
      font: '18px Arial',
      color: '#ffffff'
    });
    this.assetText.setOrigin(0.5);

    // Update progress
    this.load.on('progress', (value: number) => {
      this.updateProgress(value);
    });

    this.load.on('fileprogress', (file: any) => {
      this.assetText?.setText('Loading: ' + file.key);
    });

    this.load.on('complete', () => {
      this.onLoadComplete();
    });
  }

  private updateProgress(value: number): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    this.progressBar?.clear();
    this.progressBar?.fillStyle(0xffffff, 1);
    this.progressBar?.fillRoundedRect(
      centerX - 315,
      centerY - 25,
      630 * value,
      50,
      10
    );

    this.percentText?.setText(Math.floor(value * 100) + '%');
  }

  private loadAssets(): void {
    // Create simple, clean graphics
    this.createSimpleGemTextures();
    this.createSimpleEffectTextures();
    this.generateAudio();
  }

  private createSimpleGemTextures(): void {
    const colors = {
      red: 0xff4444,
      blue: 0x4488ff,
      green: 0x44ff44,
      yellow: 0xffff44,
      purple: 0xff44ff,
      orange: 0xffaa44
    };

    Object.entries(colors).forEach(([name, color]) => {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      const size = 80;
      const padding = 2;
      
      // Create simple clean gem shape
      graphics.fillStyle(color, 1);
      graphics.fillCircle(size / 2, size / 2, (size / 2) - padding);
      
      // Add simple subtle highlight
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillCircle(size * 0.4, size * 0.3, size * 0.15);
      
      // Add clean border
      graphics.lineStyle(2, Phaser.Display.Color.ValueToColor(color).darken(20).color, 1);
      graphics.strokeCircle(size / 2, size / 2, (size / 2) - padding);
      
      graphics.generateTexture(`gem_${name}`, size, size);
      graphics.destroy();
    });
  }

  private createSimpleEffectTextures(): void {
    const effectConfigs = [
      { name: 'glow_soft', color: 0xffffff, alpha: 0.4 },
      { name: 'selection_ring', color: 0x44ff44, alpha: 0.8 },
      { name: 'bomb_fuse', color: 0xff8844, alpha: 0.7 },
      { name: 'lightning_spark', color: 0x44ffff, alpha: 0.8 },
      { name: 'rainbow_shimmer', color: 0xff44ff, alpha: 0.6 }
    ];

    effectConfigs.forEach(({ name, color, alpha }) => {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      const size = 80;
      
      if (name === 'selection_ring') {
        // Create simple selection ring
        graphics.lineStyle(4, color, alpha);
        graphics.strokeCircle(size / 2, size / 2, 35);
      } else {
        // Create simple circular effects
        graphics.fillStyle(color, alpha);
        graphics.fillCircle(size / 2, size / 2, 30);
      }
      
      graphics.generateTexture(name, size, size);
      graphics.destroy();
    });
  }


  private onLoadComplete(): void {
    this.progressBar?.destroy();
    this.progressBox?.destroy();
    this.loadingText?.destroy();
    this.percentText?.destroy();
    this.assetText?.destroy();

    // Add a small delay before transitioning
    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }

  create(): void {
    // Create simple textures immediately in create phase
    this.createSimpleGemTextures();
    this.createSimpleEffectTextures();
    
    // Start main menu after a brief delay
    this.time.delayedCall(100, () => {
      this.scene.start('MainMenuScene');
    });
  }

  private generateAudio(): void {
    const soundGenerator = new SimpleSoundGenerator(this);
    soundGenerator.generateSimpleSounds();
  }
}