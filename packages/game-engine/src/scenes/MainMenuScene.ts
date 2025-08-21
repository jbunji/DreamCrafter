import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { gsap } from 'gsap';

export class MainMenuScene extends Phaser.Scene {
  private titleText?: Phaser.GameObjects.Text;
  private playButton?: Phaser.GameObjects.Container;
  private settingsButton?: Phaser.GameObjects.Container;
  private leaderboardButton?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    this.createBackground();
    this.createTitle();
    this.createButtons();
    this.animateEntrance();
  }

  private createBackground(): void {
    // Gradient background
    const graphics = this.add.graphics();
    const colors = [0x1a1a2e, 0x16213e, 0x0f3460];
    const stops = [0, 0.5, 1];

    for (let i = 0; i < GAME_HEIGHT; i++) {
      const t = i / GAME_HEIGHT;
      let color;
      
      if (t <= stops[1]) {
        const localT = t / stops[1];
        color = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(colors[0]),
          Phaser.Display.Color.ValueToColor(colors[1]),
          1,
          localT
        );
      } else {
        const localT = (t - stops[1]) / (1 - stops[1]);
        color = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(colors[1]),
          Phaser.Display.Color.ValueToColor(colors[2]),
          1,
          localT
        );
      }

      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      graphics.fillRect(0, i, GAME_WIDTH, 1);
    }

    // Add floating particles
    this.createFloatingParticles();
  }

  private createFloatingParticles(): void {
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(2, 6),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.3)
      );

      gsap.to(particle, {
        y: `-=${Phaser.Math.Between(100, 300)}`,
        x: `+=${Phaser.Math.Between(-50, 50)}`,
        alpha: 0,
        duration: Phaser.Math.Between(10, 20),
        repeat: -1,
        delay: Phaser.Math.FloatBetween(0, 10),
        ease: "none",
        onRepeat: () => {
          particle.x = Phaser.Math.Between(0, GAME_WIDTH);
          particle.y = GAME_HEIGHT + 50;
          particle.alpha = Phaser.Math.FloatBetween(0.1, 0.3);
        }
      });
    }
  }

  private createTitle(): void {
    this.titleText = this.add.text(GAME_WIDTH / 2, 300, 'DreamCrafter', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: {
        offsetX: 0,
        offsetY: 8,
        color: '#000000',
        blur: 15,
        fill: true
      }
    });
    this.titleText.setOrigin(0.5);
    this.titleText.setAlpha(0);

    // Add subtitle
    const subtitle = this.add.text(GAME_WIDTH / 2, 380, 'AI-Powered Match-3 Adventure', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    });
    subtitle.setOrigin(0.5);
    subtitle.setAlpha(0);

    gsap.to(subtitle, {
      alpha: 1,
      delay: 0.5,
      duration: 1,
      ease: "power2.out"
    });
  }

  private createButtons(): void {
    const buttonY = 800;
    const buttonSpacing = 150;

    // Play Button
    this.playButton = this.createButton(GAME_WIDTH / 2, buttonY, 'PLAY', () => {
      this.startGame();
    });

    // Settings Button
    this.settingsButton = this.createButton(
      GAME_WIDTH / 2 - buttonSpacing,
      buttonY + 120,
      'SETTINGS',
      () => {
        console.log('Settings clicked');
      }
    );

    // Leaderboard Button
    this.leaderboardButton = this.createButton(
      GAME_WIDTH / 2 + buttonSpacing,
      buttonY + 120,
      'SCORES',
      () => {
        console.log('Leaderboard clicked');
      }
    );
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x4a90e2, 1);
    bg.fillRoundedRect(-150, -40, 300, 80, 40);
    
    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setSize(300, 80);
    button.setInteractive({ useHandCursor: true });
    button.setAlpha(0);
    button.setScale(0.8);

    // Hover effects
    button.on('pointerover', () => {
      gsap.to(button, {
        scale: 1.1,
        duration: 0.2,
        ease: "back.out(1.7)"
      });
    });

    button.on('pointerout', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
    });

    button.on('pointerdown', () => {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.in"
      });
    });

    button.on('pointerup', () => {
      gsap.to(button, {
        scale: 1.1,
        duration: 0.1,
        ease: "power2.out",
        onComplete: callback
      });
    });

    return button;
  }

  private animateEntrance(): void {
    // Title animation
    gsap.to(this.titleText, {
      alpha: 1,
      y: '-=50',
      duration: 1,
      ease: "power2.out"
    });

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