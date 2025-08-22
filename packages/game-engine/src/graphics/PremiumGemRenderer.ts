import * as Phaser from 'phaser';

export class PremiumGemRenderer {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createHighQualityGemTextures(): void {
    this.createGemTexture('red', 0xff2b47, 0xff6b7d, 0x8b0000);
    this.createGemTexture('blue', 0x1e3a8a, 0x3b82f6, 0x1e40af);
    this.createGemTexture('green', 0x065f46, 0x10b981, 0x047857);
    this.createGemTexture('yellow', 0xfbbf24, 0xfde047, 0xf59e0b);
    this.createGemTexture('purple', 0x7c3aed, 0xa855f7, 0x6d28d9);
    this.createGemTexture('orange', 0xea580c, 0xfb923c, 0xc2410c);
  }

  private createGemTexture(colorName: string, primaryColor: number, highlightColor: number, shadowColor: number): void {
    const size = 120; // Higher resolution
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Create gem shape with multiple layers for depth
    this.createGemBase(graphics, size, primaryColor, shadowColor);
    this.createGemHighlights(graphics, size, highlightColor);
    this.createGemReflection(graphics, size);
    this.createGemBorder(graphics, size, shadowColor);
    this.createGemSparkles(graphics, size);
    
    graphics.generateTexture(`gem_${colorName}`, size, size);
    graphics.destroy();
  }

  private createGemBase(graphics: Phaser.GameObjects.Graphics, size: number, primaryColor: number, shadowColor: number): void {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    
    // Create radial gradient effect using multiple circles
    for (let i = 0; i < 10; i++) {
      const alpha = 0.8 - (i * 0.05);
      const currentRadius = radius - (i * 2);
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(primaryColor),
        Phaser.Display.Color.ValueToColor(shadowColor),
        10,
        i
      );
      
      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), alpha);
      graphics.fillCircle(centerX, centerY, currentRadius);
    }
    
    // Add faceted gem shape
    this.createFacetedShape(graphics, centerX, centerY, radius * 0.9, primaryColor);
  }

  private createFacetedShape(graphics: Phaser.GameObjects.Graphics, centerX: number, centerY: number, radius: number, color: number): void {
    const facets = 8;
    const points: number[] = [];
    
    for (let i = 0; i < facets; i++) {
      const angle = (i / facets) * Math.PI * 2;
      const r = radius * (0.8 + 0.2 * Math.sin(angle * 3));
      points.push(centerX + Math.cos(angle) * r);
      points.push(centerY + Math.sin(angle) * r);
    }
    
    graphics.fillStyle(color, 0.9);
    graphics.fillPoints(points, true);
  }

  private createGemHighlights(graphics: Phaser.GameObjects.Graphics, size: number, highlightColor: number): void {
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Main highlight
    graphics.fillStyle(highlightColor, 0.7);
    graphics.fillEllipse(centerX - size * 0.15, centerY - size * 0.1, size * 0.25, size * 0.15);
    
    // Secondary highlight
    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillEllipse(centerX - size * 0.1, centerY - size * 0.15, size * 0.15, size * 0.08);
    
    // Rim light
    graphics.lineStyle(3, highlightColor, 0.6);
    graphics.strokeCircle(centerX, centerY, size * 0.35);
  }

  private createGemReflection(graphics: Phaser.GameObjects.Graphics, size: number): void {
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Create curved reflection
    graphics.fillStyle(0xffffff, 0.3);
    // Create curved reflection using simple shapes
    graphics.fillEllipse(centerX - size * 0.15, centerY - size * 0.2, size * 0.2, size * 0.1);
  }

  private createGemBorder(graphics: Phaser.GameObjects.Graphics, size: number, shadowColor: number): void {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    
    // Outer glow
    graphics.lineStyle(6, shadowColor, 0.2);
    graphics.strokeCircle(centerX, centerY, radius + 8);
    
    // Inner border
    graphics.lineStyle(2, shadowColor, 0.8);
    graphics.strokeCircle(centerX, centerY, radius);
  }

  private createGemSparkles(graphics: Phaser.GameObjects.Graphics, size: number): void {
    const sparklePositions = [
      { x: size * 0.3, y: size * 0.25, size: 3 },
      { x: size * 0.7, y: size * 0.35, size: 2 },
      { x: size * 0.25, y: size * 0.65, size: 2.5 },
      { x: size * 0.75, y: size * 0.7, size: 2 },
      { x: size * 0.5, y: size * 0.8, size: 1.5 }
    ];
    
    graphics.fillStyle(0xffffff, 0.8);
    sparklePositions.forEach(sparkle => {
      // Create 4-pointed star sparkle
      const centerX = sparkle.x;
      const centerY = sparkle.y;
      const sparkleSize = sparkle.size;
      
      // Create 4-pointed star manually
      graphics.beginPath();
      graphics.moveTo(centerX, centerY - sparkleSize);
      graphics.lineTo(centerX + sparkleSize * 0.3, centerY - sparkleSize * 0.3);
      graphics.lineTo(centerX + sparkleSize, centerY);
      graphics.lineTo(centerX + sparkleSize * 0.3, centerY + sparkleSize * 0.3);
      graphics.lineTo(centerX, centerY + sparkleSize);
      graphics.lineTo(centerX - sparkleSize * 0.3, centerY + sparkleSize * 0.3);
      graphics.lineTo(centerX - sparkleSize, centerY);
      graphics.lineTo(centerX - sparkleSize * 0.3, centerY - sparkleSize * 0.3);
      graphics.closePath();
      graphics.fillPath();
    });
  }

  public createAdvancedEffectTextures(): void {
    this.createSelectionRing();
    this.createPowerUpGlow();
    this.createMatchExplosion();
    this.createCascadeEffect();
    this.createComboText();
  }

  private createSelectionRing(): void {
    const size = 140;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Animated selection ring with pulsing effect
    graphics.lineStyle(8, 0x00ff88, 1);
    graphics.strokeCircle(size / 2, size / 2, size * 0.45);
    
    graphics.lineStyle(4, 0xffffff, 0.8);
    graphics.strokeCircle(size / 2, size / 2, size * 0.42);
    
    // Add rotating sparkles around the ring
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = size * 0.45;
      const x = size / 2 + Math.cos(angle) * radius;
      const y = size / 2 + Math.sin(angle) * radius;
      
      graphics.fillStyle(0xffffff, 0.9);
      // Create simple sparkle using circle
      graphics.fillCircle(x, y, 3);
    }
    
    graphics.generateTexture('selection_ring', size, size);
    graphics.destroy();
  }

  private createPowerUpGlow(): void {
    const size = 160;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Multi-layered glow effect
    const layers = [
      { radius: 70, color: 0xffd700, alpha: 0.3 },
      { radius: 50, color: 0xffff00, alpha: 0.5 },
      { radius: 30, color: 0xffffff, alpha: 0.7 }
    ];
    
    layers.forEach(layer => {
      graphics.fillStyle(layer.color, layer.alpha);
      graphics.fillCircle(size / 2, size / 2, layer.radius);
    });
    
    graphics.generateTexture('power_up_glow', size, size);
    graphics.destroy();
  }

  private createMatchExplosion(): void {
    const size = 200;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Explosion burst pattern
    const rays = 16;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const innerRadius = 20;
      const outerRadius = 90;
      
      const x1 = size / 2 + Math.cos(angle) * innerRadius;
      const y1 = size / 2 + Math.sin(angle) * innerRadius;
      const x2 = size / 2 + Math.cos(angle) * outerRadius;
      const y2 = size / 2 + Math.sin(angle) * outerRadius;
      
      graphics.lineStyle(6, 0xffffff, 0.8 - (i % 3) * 0.2);
      graphics.lineBetween(x1, y1, x2, y2);
    }
    
    // Central bright core
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(size / 2, size / 2, 15);
    
    graphics.generateTexture('match_explosion', size, size);
    graphics.destroy();
  }

  private createCascadeEffect(): void {
    const size = 180;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Flowing energy effect
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = 3 + Math.random() * 8;
      const alpha = 0.3 + Math.random() * 0.5;
      
      graphics.fillStyle(0x00ffff, alpha);
      graphics.fillCircle(x, y, radius);
    }
    
    // Add swirling pattern
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 60;
      const x = size / 2 + Math.cos(angle) * radius;
      const y = size / 2 + Math.sin(angle) * radius;
      
      graphics.fillStyle(0xffffff, 0.6);
      graphics.fillCircle(x, y, 8);
    }
    
    graphics.generateTexture('cascade_effect', size, size);
    graphics.destroy();
  }

  private createComboText(): void {
    const size = 100;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Background glow for text
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRoundedRect(10, 30, 80, 40, 10);
    
    graphics.lineStyle(3, 0xffd700, 1);
    graphics.strokeRoundedRect(10, 30, 80, 40, 10);
    
    graphics.generateTexture('combo_bg', size, size);
    graphics.destroy();
  }

  public createParticleTextures(): void {
    this.createSparkParticle();
    this.createGlowParticle();
    this.createStarParticle();
    this.createTrailParticle();
  }

  private createSparkParticle(): void {
    const size = 16;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    graphics.fillStyle(0xffffff, 1);
    // Create 4-pointed star manually
    const centerX = size / 2;
    const centerY = size / 2;
    graphics.beginPath();
    graphics.moveTo(centerX, centerY - 6);
    graphics.lineTo(centerX + 2, centerY - 2);
    graphics.lineTo(centerX + 6, centerY);
    graphics.lineTo(centerX + 2, centerY + 2);
    graphics.lineTo(centerX, centerY + 6);
    graphics.lineTo(centerX - 2, centerY + 2);
    graphics.lineTo(centerX - 6, centerY);
    graphics.lineTo(centerX - 2, centerY - 2);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.generateTexture('spark_particle', size, size);
    graphics.destroy();
  }

  private createGlowParticle(): void {
    const size = 20;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Gradient circle
    for (let i = 0; i < 5; i++) {
      const alpha = 1 - (i * 0.15);
      const radius = 8 - (i * 1.5);
      graphics.fillStyle(0xffffff, alpha);
      graphics.fillCircle(size / 2, size / 2, radius);
    }
    
    graphics.generateTexture('glow_particle', size, size);
    graphics.destroy();
  }

  private createStarParticle(): void {
    const size = 24;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    graphics.fillStyle(0xffd700, 1);
    // Create 5-pointed star manually
    const centerX = size / 2;
    const centerY = size / 2;
    const points = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5;
      const radius = i % 2 === 0 ? 10 : 4;
      points.push({
        x: centerX + Math.cos(angle - Math.PI / 2) * radius,
        y: centerY + Math.sin(angle - Math.PI / 2) * radius
      });
    }
    
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    
    graphics.lineStyle(1, 0xffffff, 1);
    graphics.strokePath();
    
    graphics.generateTexture('star_particle', size, size);
    graphics.destroy();
  }

  private createTrailParticle(): void {
    const size = 32;
    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Comet-like trail
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillEllipse(size / 2, size / 2, 24, 8);
    
    graphics.fillStyle(0xffffff, 0.4);
    graphics.fillEllipse(size / 2 + 8, size / 2, 16, 4);
    
    graphics.generateTexture('trail_particle', size, size);
    graphics.destroy();
  }
}