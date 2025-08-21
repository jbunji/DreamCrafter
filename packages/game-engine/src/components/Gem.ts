import * as Phaser from 'phaser';
import { gsap } from 'gsap';
import type { Gem as GemData, GemType, Position, SpecialType } from '@dreamcrafter/shared-types';
import { GEM_SIZE } from '../config/GameConfig';

export class Gem extends Phaser.GameObjects.Container {
  public data: GemData;
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

    this.data = gemData;
    this.gridX = gridX;
    this.gridY = gridY;

    // Create gem sprite
    this.gemSprite = scene.add.sprite(0, 0, 'gems', `gem_${gemData.type}`);
    this.gemSprite.setDisplaySize(GEM_SIZE * 0.8, GEM_SIZE * 0.8);
    this.add(this.gemSprite);

    // Add glow for special gems
    if (gemData.isSpecial && gemData.specialType) {
      this.createSpecialEffect(gemData.specialType);
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
    // Create glow effect
    this.glowSprite = this.scene.add.sprite(0, 0, 'effects', 'glow_soft');
    this.glowSprite.setBlendMode(Phaser.BlendModes.ADD);
    this.glowSprite.setScale(1.5);
    this.glowSprite.setAlpha(0.6);
    this.addAt(this.glowSprite, 0);

    // Animate glow
    gsap.to(this.glowSprite, {
      alpha: 0.3,
      scale: 2,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // Add special effect based on type
    switch (specialType) {
      case 'bomb':
        this.specialEffectSprite = this.scene.add.sprite(0, 0, 'effects', 'bomb_fuse');
        this.specialEffectSprite.play('fuse_burn');
        break;
      case 'lightning_h':
      case 'lightning_v':
        this.specialEffectSprite = this.scene.add.sprite(0, 0, 'effects', 'lightning_spark');
        this.specialEffectSprite.play('spark_idle');
        break;
      case 'rainbow':
        this.specialEffectSprite = this.scene.add.sprite(0, 0, 'effects', 'rainbow_shimmer');
        this.specialEffectSprite.play('shimmer_loop');
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
  }

  private onPointerOver(): void {
    if (!this.isSelected) {
      gsap.to(this.gemSprite, {
        scale: 1.1,
        duration: 0.2,
        ease: "back.out(1.7)"
      });
    }
  }

  private onPointerOut(): void {
    if (!this.isSelected) {
      gsap.to(this.gemSprite, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
    }
  }

  private playClickAnimation(): void {
    gsap.to(this.gemSprite, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  }

  private addIdleAnimation(): void {
    // Subtle floating animation
    gsap.to(this.gemSprite, {
      y: -5,
      duration: 2 + Math.random(),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 2
    });

    // Slight rotation for variation
    gsap.to(this.gemSprite, {
      rotation: Math.PI / 36,
      duration: 3 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 3
    });
  }

  public select(): void {
    this.isSelected = true;
    gsap.to(this.gemSprite, {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(1.7)"
    });

    // Add selection glow
    const selectionGlow = this.scene.add.sprite(0, 0, 'effects', 'selection_ring');
    selectionGlow.setName('selection');
    this.add(selectionGlow);

    gsap.fromTo(selectionGlow, 
      { scale: 0.5, alpha: 0 },
      { scale: 1.5, alpha: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
  }

  public deselect(): void {
    this.isSelected = false;
    gsap.to(this.gemSprite, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });

    // Remove selection glow
    const selectionGlow = this.getByName('selection');
    if (selectionGlow) {
      gsap.to(selectionGlow, {
        scale: 0.5,
        alpha: 0,
        duration: 0.2,
        onComplete: () => {
          selectionGlow.destroy();
        }
      });
    }
  }

  public moveTo(x: number, y: number, gridX: number, gridY: number, duration: number = 0.3): Promise<void> {
    return new Promise((resolve) => {
      this.gridX = gridX;
      this.gridY = gridY;
      this.data.position = { x: gridX, y: gridY };

      // Kill any existing move animation
      if (this.moveTimeline) {
        this.moveTimeline.kill();
      }

      this.moveTimeline = gsap.timeline({
        onComplete: () => {
          this.moveTimeline = undefined;
          resolve();
        }
      });

      // Squash and stretch during move
      this.moveTimeline.to(this.gemSprite, {
        scaleX: 1.2,
        scaleY: 0.8,
        duration: duration * 0.3,
        ease: "power2.in"
      });

      this.moveTimeline.to(this, {
        x,
        y,
        duration,
        ease: "back.inOut(1.2)"
      }, 0);

      this.moveTimeline.to(this.gemSprite, {
        scaleX: 0.9,
        scaleY: 1.1,
        duration: duration * 0.2,
        ease: "power2.out"
      }, duration * 0.8);

      this.moveTimeline.to(this.gemSprite, {
        scaleX: 1,
        scaleY: 1,
        duration: duration * 0.1,
        ease: "power2.out"
      });
    });
  }

  public fall(newY: number, gridY: number, delay: number = 0): Promise<void> {
    return new Promise((resolve) => {
      this.gridY = gridY;
      this.data.position.y = gridY;

      gsap.to(this, {
        y: newY,
        duration: 0.5,
        delay,
        ease: "bounce.out",
        onComplete: () => resolve()
      });
    });
  }

  public async playMatchAnimation(): Promise<void> {
    // Scale and fade out
    await gsap.to(this.gemSprite, {
      scale: 1.5,
      alpha: 0,
      duration: 0.3,
      ease: "back.in(1.7)"
    });
  }

  public getGridPosition(): Position {
    return { x: this.gridX, y: this.gridY };
  }

  public updateGridPosition(gridX: number, gridY: number): void {
    this.gridX = gridX;
    this.gridY = gridY;
    this.data.position = { x: gridX, y: gridY };
  }

  public destroy(): void {
    if (this.moveTimeline) {
      this.moveTimeline.kill();
    }
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.gemSprite);
    if (this.glowSprite) {
      gsap.killTweensOf(this.glowSprite);
    }
    super.destroy();
  }
}