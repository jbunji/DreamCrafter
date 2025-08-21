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
    // Create placeholder gem textures immediately
    this.createGemTextures();
    this.createEffectTextures();
    this.createPlaceholderAtlases();
  }

  private createGemTextures(): void {
    const colors = {
      red: 0xff0000,
      blue: 0x0000ff,
      green: 0x00ff00,
      yellow: 0xffff00,
      purple: 0xff00ff,
      orange: 0xffa500
    };

    Object.entries(colors).forEach(([name, color]) => {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      
      // Create glossy gem effect
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(0, 0, 80, 80, 15);
      
      // Add highlight
      graphics.fillStyle(0xffffff, 0.4);
      graphics.fillEllipse(25, 25, 30, 20);
      
      // Add darker edge
      graphics.lineStyle(3, Phaser.Display.Color.ValueToColor(color).darken(30).color, 1);
      graphics.strokeRoundedRect(0, 0, 80, 80, 15);
      
      graphics.generateTexture(`gem_${name}`, 80, 80);
      graphics.destroy();
    });
  }

  private createEffectTextures(): void {
    const effectConfigs = [
      { name: 'glow_soft', color: 0xffffff, alpha: 0.6 },
      { name: 'selection_ring', color: 0x00ff00, alpha: 0.8 },
      { name: 'bomb_fuse', color: 0xff6600, alpha: 0.7 },
      { name: 'lightning_spark', color: 0x00ffff, alpha: 0.9 },
      { name: 'rainbow_shimmer', color: 0xff00ff, alpha: 0.5 }
    ];

    effectConfigs.forEach(({ name, color, alpha }) => {
      const graphics = this.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(color, alpha);
      graphics.fillCircle(40, 40, 35);
      
      // Add glow effect
      graphics.fillStyle(color, alpha * 0.3);
      graphics.fillCircle(40, 40, 50);
      
      graphics.generateTexture(name, 80, 80);
      graphics.destroy();
    });
  }

  private createPlaceholderAtlases(): void {
    // We'll create the atlases in the create() method after textures are ready
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
    // Ensure all gem textures exist
    if (!this.textures.exists('gem_red')) {
      this.createGemTextures();
    }
    
    // Ensure all effect textures exist
    if (!this.textures.exists('glow_soft')) {
      this.createEffectTextures();
    }

    // Create proper texture atlases
    this.createTextureAtlases();
  }

  private createTextureAtlases(): void {
    // Create gems atlas
    const gemAtlas = {
      frames: {} as any
    };

    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    colors.forEach((color) => {
      gemAtlas.frames[`gem_${color}`] = {
        frame: { x: 0, y: 0, w: 80, h: 80 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 80, h: 80 },
        sourceSize: { w: 80, h: 80 }
      };
    });

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
          frame: { x: 0, y: 0, w: 80, h: 80 },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: 80, h: 80 },
          sourceSize: { w: 80, h: 80 }
        }
      }
    };

    this.cache.json.add('effects_atlas', effectsAtlas);

    // Add texture atlases to Phaser
    if (!this.textures.exists('gems')) {
      // Create a combined texture canvas for the atlas
      const canvas = document.createElement('canvas');
      canvas.width = 480; // 6 gems * 80px
      canvas.height = 80;
      const ctx = canvas.getContext('2d')!;

      colors.forEach((color, index) => {
        const texture = this.textures.get(`gem_${color}`);
        ctx.drawImage(texture.getSourceImage(), index * 80, 0);
      });

      this.textures.addBase64('gems_combined', canvas.toDataURL());
      
      // Update atlas frame positions
      colors.forEach((color, index) => {
        gemAtlas.frames[`gem_${color}`].frame.x = index * 80;
      });

      this.cache.json.add('gems_atlas_updated', gemAtlas);
      this.textures.addAtlas('gems', 'gems_combined', 'gems_atlas_updated');
    }

    if (!this.textures.exists('effects')) {
      this.textures.addAtlas('effects', this.textures.get('glow_soft').getSourceImage(), effectsAtlas);
    }
  }
}