import * as Phaser from 'phaser';
import { gsap } from 'gsap';
import type { Gem as GemData, Position, SpecialType } from '@dreamcrafter/shared-types';
import { SoundEffects } from '@dreamcrafter/shared-types';
import { GEM_SIZE } from '../config/GameConfig';

export class Gem extends Phaser.GameObjects.Container {
  public gemData: GemData;
  private gemSprite: Phaser.GameObjects.Sprite;
  private glowSprite?: Phaser.GameObjects.Sprite;
  private specialEffectSprite?: Phaser.GameObjects.Sprite;
  private gridX: number;
  private gridY: number;
  private isSelected: boolean = false;
  private moveTimeline?: gsap.core.Timeline;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    gridX: number,
    gridY: number,
    gemData: GemData
  ) {
    super(scene, x, y);

    this.gemData = gemData;
    this.gridX = gridX;
    this.gridY = gridY;

    // Create gem sprite using texture directly
    this.gemSprite = scene.add.sprite(0, 0, `gem_${this.gemData.type}`);
    this.gemSprite.setDisplaySize(GEM_SIZE * 0.8, GEM_SIZE * 0.8);
    this.add(this.gemSprite);

    // Add glow for special gems
    if (this.gemData.isSpecial && this.gemData.specialType) {
      this.createSpecialEffect(this.gemData.specialType);
    }

    // Set up interactions
    this.setSize(GEM_SIZE, GEM_SIZE);
    this.setInteractive({ useHandCursor: true });
    this.setupInteractions();

    // Add subtle idle animation
    this.addIdleAnimation();

    scene.add.existing(this);
  }

  private createSpecialEffect(specialType: SpecialType): void {
    // Create simple glow effect
    this.glowSprite = this.scene.add.sprite(0, 0, 'glow_soft');
    this.glowSprite.setBlendMode(Phaser.BlendModes.ADD);
    this.glowSprite.setScale(1.2);
    this.glowSprite.setAlpha(0.4);
    this.addAt(this.glowSprite, 0);

    // Simple subtle glow animation
    gsap.to(this.glowSprite, {
      alpha: 0.2,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Add simple special effect indicator based on type
    switch (specialType) {
      case 'bomb':
        this.specialEffectSprite = this.scene.add.sprite(0, 0, 'bomb_fuse');
        this.specialEffectSprite.setScale(0.8);
        break;
      case 'lightning_h':
      case 'lightning_v':
        this.specialEffectSprite = this.scene.add.sprite(0, 0, 'lightning_spark');
        this.specialEffectSprite.setScale(0.8);
        break;
      case 'rainbow':
        this.specialEffectSprite = this.scene.add.sprite(0, 0, 'rainbow_shimmer');
        this.specialEffectSprite.setScale(0.8);
        break;
    }

    if (this.specialEffectSprite) {
      this.add(this.specialEffectSprite);
    }
  }

  private setupInteractions(): void {
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
  }

  private onPointerDown(): void {
    this.emit('gemClicked', this);
    this.playClickAnimation();
    
    // Play gem click sound
    this.scene.sound.play(SoundEffects.GEM_CLICK, { volume: 0.3 });
  }

  private onPointerOver(): void {
    if (!this.isSelected) {
      // Kill any existing hover animations to prevent stacking
      gsap.killTweensOf(this.gemSprite);
      gsap.to(this.gemSprite, {
        scale: 1.1,
        duration: 0.2,
        ease: "back.out(1.7)"
      });
    }
  }

  private onPointerOut(): void {
    if (!this.isSelected) {
      // Kill any existing hover animations to prevent stacking
      gsap.killTweensOf(this.gemSprite);
      gsap.to(this.gemSprite, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
    }
  }

  private playClickAnimation(): void {
    // Kill existing animations to prevent interference
    gsap.killTweensOf(this.gemSprite);
    gsap.to(this.gemSprite, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  }

  private addIdleAnimation(): void {
    // Very subtle breathing animation only
    gsap.to(this.gemSprite, {
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 2
    });
  }

  public select(): void {
    this.isSelected = true;
    // Kill any existing animations and scale up simply
    gsap.killTweensOf(this.gemSprite);
    gsap.to(this.gemSprite, {
      scale: 1.15,
      duration: 0.15,
      ease: "power2.out"
    });

    // Add simple selection ring
    const selectionGlow = this.scene.add.sprite(0, 0, 'selection_ring');
    selectionGlow.setName('selection');
    selectionGlow.setAlpha(0.8);
    this.add(selectionGlow);
  }

  public deselect(): void {
    this.isSelected = false;
    // Kill any existing animations and reset to normal scale
    gsap.killTweensOf(this.gemSprite);
    gsap.to(this.gemSprite, {
      scale: 1,
      duration: 0.15,
      ease: "power2.out"
    });

    // Remove selection glow immediately
    const selectionGlow = this.getByName('selection');
    if (selectionGlow) {
      selectionGlow.destroy();
    }
  }

  public moveToPosition(x: number, y: number, gridX: number, gridY: number, duration: number = 0.3): Promise<void> {
    return new Promise((resolve) => {
      this.gridX = gridX;
      this.gridY = gridY;
      this.gemData.position = { x: gridX, y: gridY };

      // Kill any existing move animation
      if (this.moveTimeline) {
        this.moveTimeline.kill();
      }

      // Simple move animation without complex effects
      gsap.to(this, {
        x,
        y,
        duration,
        ease: "power2.out",
        onComplete: () => {
          this.moveTimeline = undefined;
          resolve();
        }
      });
    });
  }

  public fall(newY: number, gridY: number, delay: number = 0): Promise<void> {
    return new Promise((resolve) => {
      this.gridY = gridY;
      this.gemData.position.y = gridY;

      gsap.to(this, {
        y: newY,
        duration: 0.4,
        delay,
        ease: "power2.out",
        onComplete: () => resolve()
      });
    });
  }

  public async playMatchAnimation(): Promise<void> {
    // Simple scale and fade out
    return new Promise((resolve) => {
      gsap.to(this.gemSprite, {
        scale: 1.2,
        alpha: 0,
        duration: 0.25,
        ease: "power2.in",
        onComplete: resolve
      });
    });
  }

  public getGridPosition(): Position {
    return { x: this.gridX, y: this.gridY };
  }

  public updateGridPosition(gridX: number, gridY: number): void {
    this.gridX = gridX;
    this.gridY = gridY;
    this.gemData.position = { x: gridX, y: gridY };
  }

  public destroy(): void {
    // Clean up GSAP animations first
    if (this.moveTimeline) {
      this.moveTimeline.kill();
      this.moveTimeline = undefined;
    }
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.gemSprite);
    if (this.glowSprite) {
      gsap.killTweensOf(this.glowSprite);
    }
    if (this.specialEffectSprite) {
      gsap.killTweensOf(this.specialEffectSprite);
    }
    
    // Remove event listeners
    this.removeAllListeners();
    
    // Destroy with destroyChildren flag
    super.destroy(true);
  }
}