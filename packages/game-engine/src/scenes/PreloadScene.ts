import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';

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
    // Load placeholder assets for now
    // In production, these would be actual game assets
    
    // Create placeholder textures
    this.load.on('start', () => {
      // Generate colored squares as placeholder gems
      const colors = {
        red: 0xff0000,
        blue: 0x0000ff,
        green: 0x00ff00,
        yellow: 0xffff00,
        purple: 0xff00ff,
        orange: 0xffa500
      };

      Object.entries(colors).forEach(([name, color]) => {
        this.load.on('start', () => {
          const graphics = this.make.graphics({ x: 0, y: 0 }, false);
          graphics.fillStyle(color, 1);
          graphics.fillRoundedRect(0, 0, 80, 80, 20);
          graphics.generateTexture(`gem_${name}`, 80, 80);
          graphics.destroy();
        });
      });

      // Create placeholder effects
      const effectColors = {
        glow_soft: 0xffffff,
        selection_ring: 0x00ff00,
        bomb_fuse: 0xff6600,
        lightning_spark: 0x00ffff,
        rainbow_shimmer: 0xff00ff
      };

      Object.entries(effectColors).forEach(([name, color]) => {
        this.load.on('start', () => {
          const graphics = this.make.graphics({ x: 0, y: 0 }, false);
          graphics.fillStyle(color, 0.5);
          graphics.fillCircle(40, 40, 40);
          graphics.generateTexture(name, 80, 80);
          graphics.destroy();
        });
      });
    });

    // Create sprite atlases (placeholder)
    this.createPlaceholderAtlases();

    // Load audio (placeholder)
    // this.load.audio('match', 'assets/audio/match.mp3');
    // this.load.audio('swap', 'assets/audio/swap.mp3');
    // this.load.audio('cascade', 'assets/audio/cascade.mp3');
    // this.load.audio('bgm', 'assets/audio/bgm.mp3');
  }

  private createPlaceholderAtlases(): void {
    // Create a simple atlas for gems
    const gemAtlas = {
      frames: {}
    };

    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    colors.forEach((color, index) => {
      (gemAtlas.frames as any)[`gem_${color}`] = {
        frame: { x: 0, y: 0, w: 80, h: 80 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 80, h: 80 },
        sourceSize: { w: 80, h: 80 }
      };
    });

    // Register the atlas
    this.cache.json.add('gems_atlas', gemAtlas);

    // Create effects atlas
    const effectsAtlas = {
      frames: {
        glow_soft: {
          frame: { x: 0, y: 0, w: 80, h: 80 },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: 80, h: 80 },
          sourceSize: { w: 80, h: 80 }
        },
        selection_ring: {
          frame: { x: 80, y: 0, w: 80, h: 80 },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: 80, h: 80 },
          sourceSize: { w: 80, h: 80 }
        }
      }
    };

    this.cache.json.add('effects_atlas', effectsAtlas);
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
    // Create placeholder textures if loading was too fast
    const colors = {
      red: 0xff0000,
      blue: 0x0000ff,
      green: 0x00ff00,
      yellow: 0xffff00,
      purple: 0xff00ff,
      orange: 0xffa500
    };

    Object.entries(colors).forEach(([name, color]) => {
      if (!this.textures.exists(`gem_${name}`)) {
        const graphics = this.make.graphics({ x: 0, y: 0 }, false);
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(0, 0, 80, 80, 20);
        graphics.generateTexture(`gem_${name}`, 80, 80);
        graphics.destroy();
      }
    });

    // Create placeholder effects
    const effectColors = {
      glow_soft: 0xffffff,
      selection_ring: 0x00ff00,
      bomb_fuse: 0xff6600,
      lightning_spark: 0x00ffff,
      rainbow_shimmer: 0xff00ff
    };

    Object.entries(effectColors).forEach(([name, color]) => {
      if (!this.textures.exists(name)) {
        const graphics = this.make.graphics({ x: 0, y: 0 }, false);
        graphics.fillStyle(color, 0.5);
        graphics.fillCircle(40, 40, 40);
        graphics.generateTexture(name, 80, 80);
        graphics.destroy();
      }
    });

    // Create texture atlases
    if (!this.textures.exists('gems')) {
      this.textures.addAtlas('gems', this.textures.get('gem_red').getSourceImage(), this.cache.json.get('gems_atlas'));
    }

    if (!this.textures.exists('effects')) {
      this.textures.addAtlas('effects', this.textures.get('glow_soft').getSourceImage(), this.cache.json.get('effects_atlas'));
    }
  }
}