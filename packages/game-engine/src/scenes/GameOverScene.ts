import * as Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { gsap } from 'gsap';

export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private level: number = 1;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; level: number }): void {
    this.score = data.score || 0;
    this.level = data.level || 1;
  }

  create(): void {
    this.createBackground();
    this.createGameOverUI();
    this.animateEntry();
  }

  private createBackground(): void {
    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.8);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  private createGameOverUI(): void {
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    // Game Over title
    const gameOverText = this.add.text(centerX, centerY - 200, 'GAME OVER', {
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
    }).setOrigin(0.5);
    gameOverText.setAlpha(0);

    // Score display
    const scoreLabel = this.add.text(centerX, centerY - 50, 'FINAL SCORE', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    scoreLabel.setAlpha(0);

    const scoreText = this.add.text(centerX, centerY + 10, this.score.toString(), {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffff00',
      fontStyle: 'bold',
      shadow: {
        offsetX: 0,
        offsetY: 4,
        color: '#000000',
        blur: 10,
        fill: true
      }
    }).setOrigin(0.5);
    scoreText.setAlpha(0);

    // Level reached
    const levelText = this.add.text(centerX, centerY + 100, `Level ${this.level} Completed`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#4a90e2'
    }).setOrigin(0.5);
    levelText.setAlpha(0);

    // Buttons
    const retryButton = this.createButton(centerX - 150, centerY + 250, 'RETRY', () => {
      this.fadeOutAndStart('GameScene', { level: this.level });
    });

    const menuButton = this.createButton(centerX + 150, centerY + 250, 'MENU', () => {
      this.fadeOutAndStart('MainMenuScene');
    });

    // Store references for animation
    (this as any).uiElements = [gameOverText, scoreLabel, scoreText, levelText, retryButton, menuButton];
  }

  private createButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x4a90e2, 1);
    bg.fillRoundedRect(-120, -35, 240, 70, 35);
    
    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setSize(240, 70);
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

  private animateEntry(): void {
    const elements = (this as any).uiElements;
    
    elements.forEach((element: any, index: number) => {
      gsap.to(element, {
        alpha: 1,
        scale: index >= 4 ? 1 : undefined, // Only scale buttons
        delay: index * 0.1,
        duration: 0.5,
        ease: index >= 4 ? "back.out(1.7)" : "power2.out"
      });
    });

    // Animate score counting
    const scoreText = elements[2];
    const targetScore = this.score;
    const scoreObj = { score: 0 };
    
    gsap.to(scoreObj, {
      score: targetScore,
      delay: 0.5,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: () => {
        scoreText.setText(Math.floor(scoreObj.score).toString());
      }
    });
  }

  private fadeOutAndStart(sceneKey: string, data?: any): void {
    gsap.to(this.cameras.main, {
      alpha: 0,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        this.scene.start(sceneKey, data);
      }
    });
  }
}