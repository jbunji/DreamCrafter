import * as Phaser from 'phaser';
import { gsap } from 'gsap';

export class PremiumBackgroundRenderer {
  private scene: Phaser.Scene;
  private animatedElements: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createDynamicBackground(width: number, height: number): void {
    this.createGradientBackground(width, height);
    this.createFloatingOrbs(width, height);
    this.createParticleField(width, height);
    this.createEnergyStreams(width, height);
    this.createGridOverlay(width, height);
  }

  private createGradientBackground(width: number, height: number): void {
    // Multi-layer gradient background
    const graphics = this.scene.add.graphics();
    
    // Base gradient
    const colors = [
      { stop: 0, color: 0x0f0f23 },
      { stop: 0.3, color: 0x1a1a3e },
      { stop: 0.6, color: 0x2d1b69 },
      { stop: 1, color: 0x0f0f23 }
    ];
    
    for (let i = 0; i < height; i++) {
      const progress = i / height;
      let currentColor = colors[0].color;
      
      // Find the appropriate color segment
      for (let j = 1; j < colors.length; j++) {
        if (progress <= colors[j].stop) {
          const segmentProgress = (progress - colors[j - 1].stop) / (colors[j].stop - colors[j - 1].stop);
          const color1 = Phaser.Display.Color.ValueToColor(colors[j - 1].color);
          const color2 = Phaser.Display.Color.ValueToColor(colors[j].color);
          const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(color1, color2, 1, segmentProgress);
          currentColor = Phaser.Display.Color.GetColor(interpolated.r, interpolated.g, interpolated.b);
          break;
        }
      }
      
      graphics.fillStyle(currentColor, 1);
      graphics.fillRect(0, i, width, 1);
    }
    
    // Add animated overlay
    this.createAnimatedOverlay(width, height);
  }

  private createAnimatedOverlay(width: number, height: number): void {
    const overlay = this.scene.add.graphics();
    
    const updateOverlay = () => {
      overlay.clear();
      const time = this.scene.time.now * 0.001;
      
      // Create moving waves
      for (let i = 0; i < 5; i++) {
        const waveY = (Math.sin(time + i) * 50) + height / 2;
        const alpha = 0.1 + Math.sin(time + i) * 0.05;
        
        overlay.fillStyle(0x4a90e2, alpha);
        overlay.fillEllipse(width / 2, waveY, width * 1.5, 100);
      }
    };
    
    // Update overlay continuously
    this.scene.time.addEvent({
      delay: 50,
      callback: updateOverlay,
      loop: true
    });
    
    this.animatedElements.push(overlay);
  }

  private createFloatingOrbs(width: number, height: number): void {
    const orbCount = 15;
    
    for (let i = 0; i < orbCount; i++) {
      const orb = this.createGlowOrb();
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const scale = 0.3 + Math.random() * 0.7;
      
      orb.setPosition(startX, startY);
      orb.setScale(scale);
      orb.setAlpha(0.4 + Math.random() * 0.4);
      
      // Floating animation
      gsap.to(orb, {
        x: startX + (Math.random() - 0.5) * 200,
        y: startY + (Math.random() - 0.5) * 200,
        duration: 8 + Math.random() * 4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
      
      // Pulsing animation
      gsap.to(orb, {
        scaleX: scale * 1.2,
        scaleY: scale * 1.2,
        duration: 3 + Math.random() * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
      
      this.animatedElements.push(orb);
    }
  }

  private createGlowOrb(): Phaser.GameObjects.Graphics {
    const orb = this.scene.add.graphics();
    
    // Multi-layer glow effect
    const layers = [
      { radius: 20, color: 0x4a90e2, alpha: 0.8 },
      { radius: 15, color: 0x74b9ff, alpha: 0.6 },
      { radius: 10, color: 0xffffff, alpha: 0.4 },
      { radius: 5, color: 0xffffff, alpha: 0.8 }
    ];
    
    layers.forEach(layer => {
      orb.fillStyle(layer.color, layer.alpha);
      orb.fillCircle(0, 0, layer.radius);
    });
    
    return orb;
  }

  private createParticleField(width: number, height: number): void {
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.scene.add.graphics();
      const size = 1 + Math.random() * 3;
      
      particle.fillStyle(0xffffff, 0.6 + Math.random() * 0.4);
      particle.fillCircle(0, 0, size);
      
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      particle.setPosition(startX, startY);
      
      // Twinkling animation
      gsap.to(particle, {
        alpha: 0.2 + Math.random() * 0.6,
        duration: 2 + Math.random() * 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
      
      // Slow drift
      gsap.to(particle, {
        x: startX + (Math.random() - 0.5) * 100,
        y: startY + (Math.random() - 0.5) * 100,
        duration: 15 + Math.random() * 10,
        ease: 'none',
        repeat: -1,
        yoyo: true
      });
      
      this.animatedElements.push(particle);
    }
  }

  private createEnergyStreams(width: number, height: number): void {
    const streamCount = 3;
    
    for (let i = 0; i < streamCount; i++) {
      const stream = this.scene.add.graphics();
      this.drawEnergyStream(stream, width, height, i);
      
      this.animatedElements.push(stream);
    }
  }

  private drawEnergyStream(graphics: Phaser.GameObjects.Graphics, width: number, height: number, index: number): void {
    const updateStream = () => {
      graphics.clear();
      const time = this.scene.time.now * 0.002;
      const offset = index * 2;
      
      // Create flowing energy stream
      const points: number[] = [];
      const segments = 20;
      
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width;
        const y = height / 2 + Math.sin(time + offset + i * 0.5) * 30;
        points.push(x, y);
      }
      
      graphics.lineStyle(3, 0x00ffff, 0.3);
      graphics.strokePoints(points);
      
      graphics.lineStyle(1, 0xffffff, 0.6);
      graphics.strokePoints(points);
    };
    
    this.scene.time.addEvent({
      delay: 50,
      callback: updateStream,
      loop: true
    });
  }

  private createGridOverlay(width: number, height: number): void {
    const gridGraphics = this.scene.add.graphics();
    gridGraphics.setAlpha(0.1);
    
    // Draw grid lines
    gridGraphics.lineStyle(1, 0x4a90e2, 0.3);
    
    const gridSize = 50;
    
    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, height);
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(width, y);
    }
    
    gridGraphics.strokePath();
    
    this.animatedElements.push(gridGraphics);
  }

  public createGameBoardFrame(x: number, y: number, width: number, height: number): void {
    const frame = this.scene.add.graphics();
    frame.setPosition(x, y);
    
    // Outer glow
    frame.lineStyle(8, 0x4a90e2, 0.6);
    frame.strokeRoundedRect(-10, -10, width + 20, height + 20, 15);
    
    // Inner frame
    frame.lineStyle(4, 0x74b9ff, 0.9);
    frame.strokeRoundedRect(-5, -5, width + 10, height + 10, 10);
    
    // Corner decorations
    this.addCornerDecorations(frame, width, height);
    
    // Animated border effect
    this.animateBorderGlow(frame, width, height);
    
    this.animatedElements.push(frame);
  }

  private addCornerDecorations(graphics: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const cornerSize = 20;
    const positions = [
      { x: -cornerSize/2, y: -cornerSize/2 },
      { x: width - cornerSize/2, y: -cornerSize/2 },
      { x: -cornerSize/2, y: height - cornerSize/2 },
      { x: width - cornerSize/2, y: height - cornerSize/2 }
    ];
    
    graphics.fillStyle(0xffd700, 0.8);
    positions.forEach(pos => {
      // Create 4-pointed star manually
      graphics.beginPath();
      graphics.moveTo(pos.x, pos.y - 15);
      graphics.lineTo(pos.x + 5, pos.y - 5);
      graphics.lineTo(pos.x + 15, pos.y);
      graphics.lineTo(pos.x + 5, pos.y + 5);
      graphics.lineTo(pos.x, pos.y + 15);
      graphics.lineTo(pos.x - 5, pos.y + 5);
      graphics.lineTo(pos.x - 15, pos.y);
      graphics.lineTo(pos.x - 5, pos.y - 5);
      graphics.closePath();
      graphics.fillPath();
    });
  }

  private animateBorderGlow(graphics: Phaser.GameObjects.Graphics, width: number, height: number): void {
    let glowPhase = 0;
    
    const updateGlow = () => {
      glowPhase += 0.1;
      const glowIntensity = 0.3 + Math.sin(glowPhase) * 0.2;
      
      // Redraw border with animated glow
      graphics.clear();
      
      // Animated outer glow
      graphics.lineStyle(8, 0x4a90e2, glowIntensity);
      graphics.strokeRoundedRect(-10, -10, width + 20, height + 20, 15);
      
      // Static inner frame
      graphics.lineStyle(4, 0x74b9ff, 0.9);
      graphics.strokeRoundedRect(-5, -5, width + 10, height + 10, 10);
      
      // Redraw corner decorations
      this.addCornerDecorations(graphics, width, height);
    };
    
    this.scene.time.addEvent({
      delay: 100,
      callback: updateGlow,
      loop: true
    });
  }

  public createUIElements(): void {
    this.createScorePanel();
    this.createMovesPanel();
    this.createLevelIndicator();
  }

  private createScorePanel(): void {
    // Enhanced score panel with glowing effects
    const panel = this.scene.add.graphics();
    panel.setPosition(50, 50);
    
    // Background with gradient
    panel.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2d1b69, 0x2d1b69, 0.9);
    panel.fillRoundedRect(0, 0, 300, 80, 15);
    
    // Glowing border
    panel.lineStyle(3, 0x4a90e2, 0.8);
    panel.strokeRoundedRect(0, 0, 300, 80, 15);
    
    this.animatedElements.push(panel);
  }

  private createMovesPanel(): void {
    const panel = this.scene.add.graphics();
    panel.setPosition(400, 50);
    
    panel.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2d1b69, 0x2d1b69, 0.9);
    panel.fillRoundedRect(0, 0, 200, 80, 15);
    
    panel.lineStyle(3, 0xff6b47, 0.8);
    panel.strokeRoundedRect(0, 0, 200, 80, 15);
    
    this.animatedElements.push(panel);
  }

  private createLevelIndicator(): void {
    const indicator = this.scene.add.graphics();
    indicator.setPosition(650, 50);
    
    indicator.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x2d1b69, 0x2d1b69, 0.9);
    indicator.fillRoundedRect(0, 0, 150, 80, 15);
    
    indicator.lineStyle(3, 0x2ed573, 0.8);
    indicator.strokeRoundedRect(0, 0, 150, 80, 15);
    
    this.animatedElements.push(indicator);
  }

  public destroy(): void {
    this.animatedElements.forEach(element => {
      if (element && element.destroy) {
        element.destroy();
      }
    });
    this.animatedElements = [];
  }
}