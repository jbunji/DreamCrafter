import * as Phaser from 'phaser';
import { gsap } from 'gsap';

export class AdvancedParticleSystem {
  private scene: Phaser.Scene;
  private particleEmitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createGemMatchExplosion(x: number, y: number, gemColor: string): void {
    // Multi-layered explosion effect
    this.createCoreExplosion(x, y, gemColor);
    this.createSparkBurst(x, y);
    this.createGlowWave(x, y);
    this.createColorTrails(x, y, gemColor);
  }

  private createCoreExplosion(x: number, y: number, gemColor: string): void {
    const colorMap: { [key: string]: number } = {
      'red': 0xff4757,
      'blue': 0x3742fa,
      'green': 0x2ed573,
      'yellow': 0xffa502,
      'purple': 0x5352ed,
      'orange': 0xff6348
    };

    const particles = this.scene.add.particles(x, y, 'glow_particle', {
      speed: { min: 100, max: 300 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 20,
      blendMode: 'ADD',
      tint: colorMap[gemColor] || 0xffffff,
      emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 5), quantity: 20 }
    });

    // Auto-destroy after emission
    this.scene.time.delayedCall(700, () => {
      particles.destroy();
    });
  }

  private createSparkBurst(x: number, y: number): void {
    const sparks = this.scene.add.particles(x, y, 'spark_particle', {
      speed: { min: 150, max: 400 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 15,
      blendMode: 'ADD',
      rotate: { min: 0, max: 360 },
      gravityY: 100,
      bounce: 0.3
    });

    this.scene.time.delayedCall(900, () => {
      sparks.destroy();
    });
  }

  private createGlowWave(x: number, y: number): void {
    // Create expanding ring effect
    const ring = this.scene.add.graphics();
    ring.setPosition(x, y);
    
    gsap.timeline()
      .to(ring, {
        duration: 0.5,
        ease: 'power2.out',
        onUpdate: () => {
          ring.clear();
          const progress = gsap.getProperty(ring, 'progress') as number || 0;
          const radius = progress * 100;
          const alpha = 1 - progress;
          
          ring.lineStyle(8, 0xffffff, alpha);
          ring.strokeCircle(0, 0, radius);
          ring.lineStyle(4, 0xffd700, alpha * 0.8);
          ring.strokeCircle(0, 0, radius - 4);
        }
      })
      .set(ring, { progress: 0 })
      .to(ring, { progress: 1, duration: 0.5 })
      .call(() => ring.destroy());
  }

  private createColorTrails(x: number, y: number, gemColor: string): void {
    const colorMap: { [key: string]: number } = {
      'red': 0xff4757,
      'blue': 0x3742fa,
      'green': 0x2ed573,
      'yellow': 0xffa502,
      'purple': 0x5352ed,
      'orange': 0xff6348
    };

    const trails = this.scene.add.particles(x, y, 'trail_particle', {
      speed: { min: 80, max: 200 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1000,
      quantity: 8,
      blendMode: 'ADD',
      tint: colorMap[gemColor] || 0xffffff,
      rotate: { min: 0, max: 360 }
    });

    this.scene.time.delayedCall(1100, () => {
      trails.destroy();
    });
  }

  public createCascadeEffect(x: number, y: number, multiplier: number): void {
    // Enhanced cascade with increasing intensity
    const baseIntensity = Math.min(multiplier, 5);
    
    this.createEnergySpiral(x, y, baseIntensity);
    this.createLightningEffect(x, y, baseIntensity);
    this.createMagicDust(x, y, baseIntensity);
  }

  private createEnergySpiral(x: number, y: number, intensity: number): void {
    const particles = this.scene.add.particles(x, y, 'glow_particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 1500,
      quantity: intensity * 5,
      blendMode: 'ADD',
      tint: [0x00ffff, 0xff00ff, 0xffff00]
    });

    // Create spiral motion
    let angle = 0;
    const spiralTimer = this.scene.time.addEvent({
      delay: 50,
      repeat: 30,
      callback: () => {
        angle += 0.3;
        const spiralX = x + Math.cos(angle) * (angle * 2);
        const spiralY = y + Math.sin(angle) * (angle * 2);
        particles.setPosition(spiralX, spiralY);
      }
    });

    this.scene.time.delayedCall(1600, () => {
      particles.destroy();
      spiralTimer.destroy();
    });
  }

  private createLightningEffect(x: number, y: number, intensity: number): void {
    for (let i = 0; i < intensity; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const lightning = this.scene.add.graphics();
        this.drawLightningBolt(lightning, x, y);
        
        gsap.to(lightning, {
          alpha: 0,
          duration: 0.2,
          onComplete: () => lightning.destroy()
        });
      });
    }
  }

  private drawLightningBolt(graphics: Phaser.GameObjects.Graphics, startX: number, startY: number): void {
    const segments = 8;
    const maxDeviation = 30;
    let currentX = startX;
    let currentY = startY;
    
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.moveTo(currentX, currentY);
    
    for (let i = 0; i < segments; i++) {
      const targetX = startX + (Math.random() - 0.5) * 100;
      const targetY = startY + (i + 1) * 20 + (Math.random() - 0.5) * maxDeviation;
      
      graphics.lineTo(targetX, targetY);
      currentX = targetX;
      currentY = targetY;
    }
    
    graphics.strokePath();
  }

  private createMagicDust(x: number, y: number, intensity: number): void {
    const dust = this.scene.add.particles(x, y, 'star_particle', {
      speed: { min: 20, max: 80 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 2000,
      quantity: intensity * 3,
      blendMode: 'ADD',
      tint: [0xffd700, 0xffffff, 0xffb347],
      gravityY: -20,
      rotate: { min: 0, max: 360 }
    });

    this.scene.time.delayedCall(2100, () => {
      dust.destroy();
    });
  }

  public createPowerUpActivation(x: number, y: number, powerType: string): void {
    switch (powerType) {
      case 'bomb':
        this.createBombExplosion(x, y);
        break;
      case 'lightning':
        this.createLightningStrike(x, y);
        break;
      case 'rainbow':
        this.createRainbowBurst(x, y);
        break;
      default:
        this.createGenericPowerUp(x, y);
    }
  }

  private createBombExplosion(x: number, y: number): void {
    // Massive explosion with shockwave
    const explosion = this.scene.add.particles(x, y, 'glow_particle', {
      speed: { min: 200, max: 500 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 50,
      blendMode: 'ADD',
      tint: [0xff4757, 0xff6b47, 0xffa502]
    });

    // Shockwave ring
    const shockwave = this.scene.add.graphics();
    shockwave.setPosition(x, y);
    
    gsap.timeline()
      .to(shockwave, {
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          shockwave.clear();
          const progress = gsap.getProperty(shockwave, 'progress') as number || 0;
          const radius = progress * 200;
          const alpha = 1 - progress;
          
          shockwave.lineStyle(12, 0xff4757, alpha);
          shockwave.strokeCircle(0, 0, radius);
        }
      })
      .set(shockwave, { progress: 0 })
      .to(shockwave, { progress: 1, duration: 0.8 })
      .call(() => {
        shockwave.destroy();
        explosion.destroy();
      });
  }

  private createLightningStrike(x: number, y: number): void {
    // Vertical lightning bolt
    const lightning = this.scene.add.graphics();
    lightning.lineStyle(8, 0x00ffff, 1);
    lightning.moveTo(x, 0);
    lightning.lineTo(x, y);
    lightning.strokePath();
    
    // Lightning particles
    const particles = this.scene.add.particles(x, y, 'spark_particle', {
      speed: { min: 100, max: 300 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 30,
      blendMode: 'ADD',
      tint: [0x00ffff, 0xffffff, 0x00aaff]
    });

    gsap.to(lightning, {
      alpha: 0,
      duration: 0.3,
      onComplete: () => {
        lightning.destroy();
        particles.destroy();
      }
    });
  }

  private createRainbowBurst(x: number, y: number): void {
    const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x4400ff, 0xff00ff];
    
    colors.forEach((color, index) => {
      this.scene.time.delayedCall(index * 50, () => {
        const particles = this.scene.add.particles(x, y, 'star_particle', {
          speed: { min: 150, max: 250 },
          scale: { start: 0.8, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 1000,
          quantity: 10,
          blendMode: 'ADD',
          tint: color,
          angle: { min: index * 45, max: (index + 1) * 45 }
        });

        this.scene.time.delayedCall(1100, () => {
          particles.destroy();
        });
      });
    });
  }

  private createGenericPowerUp(x: number, y: number): void {
    const particles = this.scene.add.particles(x, y, 'glow_particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 25,
      blendMode: 'ADD',
      tint: [0xffd700, 0xffffff]
    });

    this.scene.time.delayedCall(900, () => {
      particles.destroy();
    });
  }

  public createGemFallTrail(x: number, y: number, targetY: number): void {
    const trail = this.scene.add.particles(x, y, 'trail_particle', {
      speed: { min: 0, max: 50 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 300,
      quantity: 2,
      blendMode: 'ADD',
      follow: { x, y }
    });

    // Follow the gem as it falls
    gsap.to(trail, {
      y: targetY,
      duration: 0.5,
      ease: 'bounce.out',
      onComplete: () => {
        trail.destroy();
      }
    });
  }

  public destroy(): void {
    this.particleEmitters.forEach(emitter => {
      emitter.destroy();
    });
    this.particleEmitters.clear();
  }
}