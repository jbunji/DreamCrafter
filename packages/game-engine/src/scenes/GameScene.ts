import * as Phaser from 'phaser';
import { GameGrid } from '../systems/GameGrid';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import type { GameState, PlayerProfile, MoveResult } from '@dreamcrafter/shared-types';
import { SoundEffects, MusicTracks } from '@dreamcrafter/shared-types';
import { AudioManager } from '../audio/AudioManager';
import { gsap } from 'gsap';

export class GameScene extends Phaser.Scene {
  private gameGrid?: GameGrid;
  private scoreText?: Phaser.GameObjects.Text;
  private movesText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private gameState: GameState;
  private isPaused: boolean = false;
  private audioManager?: AudioManager;

  constructor() {
    super({ key: 'GameScene' });

    // Initialize default game state
    this.gameState = {
      level: 1,
      score: 0,
      moves: 0,
      movesLeft: 30,
      grid: [],
      objectives: [],
      powerUps: [],
      difficulty: 0.5,
      puzzleId: '',
      isPaused: false,
      isGameOver: false
    };
  }

  init(data: { level: number; playerProfile?: PlayerProfile }): void {
    this.gameState.level = data.level || 1;
    this.gameState.movesLeft = 30 + Math.floor(data.level / 5) * 5; // More moves as levels progress
    this.gameState.score = 0;
    this.gameState.moves = 0;
  }

  create(): void {
    this.audioManager = new AudioManager(this);
    this.createBackground();
    this.createUI();
    this.createGameGrid();
    this.setupInputHandling();
    this.animateSceneEntry();
    
    // Start gameplay music
    this.audioManager.playMusic(MusicTracks.GAMEPLAY_CALM);
  }

  private createBackground(): void {
    // Create gradient background
    const graphics = this.add.graphics();
    const colors = [0x1a1a2e, 0x16213e];
    
    for (let i = 0; i < GAME_HEIGHT; i++) {
      const t = i / GAME_HEIGHT;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(colors[0]),
        Phaser.Display.Color.ValueToColor(colors[1]),
        1,
        t
      );
      
      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      graphics.fillRect(0, i, GAME_WIDTH, 1);
    }

    // Add grid background
    const gridBg = this.add.graphics();
    gridBg.fillStyle(0x000000, 0.3);
    gridBg.fillRoundedRect(40, 380, 1000, 900, 20);
  }

  private createUI(): void {
    // Top bar background
    const topBar = this.add.graphics();
    topBar.fillStyle(0x000000, 0.5);
    topBar.fillRect(0, 0, GAME_WIDTH, 150);

    // Score
    this.add.text(50, 30, 'SCORE', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });

    this.scoreText = this.add.text(50, 60, '0', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // Moves
    this.add.text(GAME_WIDTH / 2 - 50, 30, 'MOVES', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0);

    this.movesText = this.add.text(GAME_WIDTH / 2, 60, '30', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);

    // Level
    this.add.text(GAME_WIDTH - 50, 30, 'LEVEL', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(1, 0);

    this.levelText = this.add.text(GAME_WIDTH - 50, 60, '1', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // Pause button
    const pauseButton = this.add.container(GAME_WIDTH - 100, 200);
    const pauseBg = this.add.graphics();
    pauseBg.fillStyle(0x4a90e2, 1);
    pauseBg.fillCircle(0, 0, 40);
    
    const pauseIcon = this.add.text(0, 0, '⏸', {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    pauseButton.add([pauseBg, pauseIcon]);
    pauseButton.setSize(80, 80);
    pauseButton.setInteractive({ useHandCursor: true });

    pauseButton.on('pointerdown', () => {
      this.audioManager?.playSound(SoundEffects.BUTTON_CLICK);
      this.togglePause();
    });

    // Update UI with current state
    this.updateUI();
  }

  private createGameGrid(): void {
    this.gameGrid = new GameGrid(this);
    this.gameGrid.initialize();

    // Listen for move completion
    this.gameGrid.on('moveCompleted', (result: MoveResult) => {
      this.handleMoveCompleted(result);
    });

    // Listen for gem matches for effects
    this.gameGrid.on('gemMatched', (gem: any) => {
      this.createMatchEffect(gem.x, gem.y);
      this.audioManager?.playSound(SoundEffects.GEM_MATCH);
    });
  }

  private setupInputHandling(): void {
    // ESC key for pause
    this.input.keyboard?.on('keydown-ESC', () => {
      this.togglePause();
    });
  }

  private animateSceneEntry(): void {
    // Fade in
    this.cameras.main.setAlpha(0);
    gsap.to(this.cameras.main, {
      alpha: 1,
      duration: 0.5,
      ease: "power2.out"
    });

    // UI elements animation
    const uiElements = [this.scoreText, this.movesText, this.levelText];
    uiElements.forEach((element, index) => {
      if (element) {
        element.setScale(0);
        gsap.to(element, {
          scale: 1,
          delay: 0.2 + index * 0.1,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      }
    });
  }

  private handleMoveCompleted(result: MoveResult): void {
    if (!result.valid) return;

    // Update game state
    this.gameState.score += result.score || 0;
    this.gameState.moves++;
    this.gameState.movesLeft--;

    // Update UI
    this.updateUI();

    // Check for cascades
    if (result.cascades && result.cascades > 0) {
      this.showCascadeBonus(result.cascades);
      this.audioManager?.playSound(SoundEffects.CASCADE);
    }
    
    // Adaptive music based on game intensity
    if (this.audioManager) {
      const intensity = this.audioManager.calculateGameIntensity(
        this.gameState.movesLeft, 
        30, 
        result.cascades || 0
      );
      this.audioManager.adaptMusicToGameState(intensity);
    }

    // Check game over conditions
    if (this.gameState.movesLeft <= 0) {
      this.checkGameOver();
    }
  }

  private updateUI(): void {
    this.scoreText?.setText(this.gameState.score.toString());
    this.movesText?.setText(this.gameState.movesLeft.toString());
    this.levelText?.setText(this.gameState.level.toString());

    // Animate score change
    if (this.scoreText) {
      gsap.to(this.scoreText, {
        scale: 1.2,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  }

  private createMatchEffect(x: number, y: number): void {
    // Create particle burst
    const particles = this.add.particles(x, y, 'glow_soft', {
      lifespan: 600,
      speed: { min: 100, max: 300 },
      scale: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      quantity: 5
    });

    // Auto-destroy after effect
    this.time.delayedCall(1000, () => {
      particles.destroy();
    });
  }

  private showCascadeBonus(cascades: number): void {
    const bonusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `${cascades}x CASCADE!`, {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#ff6600',
      strokeThickness: 8,
      shadow: {
        offsetX: 0,
        offsetY: 4,
        color: '#000000',
        blur: 10,
        fill: true
      }
    }).setOrigin(0.5);

    gsap.fromTo(bonusText, 
      { scale: 0, rotation: -0.2 },
      { 
        scale: 1.5, 
        rotation: 0.2,
        duration: 0.5,
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(bonusText, {
            scale: 0,
            alpha: 0,
            y: '-=100',
            duration: 0.5,
            delay: 0.5,
            ease: "power2.in",
            onComplete: () => bonusText.destroy()
          });
        }
      }
    );
  }

  private checkGameOver(): void {
    this.gameState.isGameOver = true;
    
    // Play game over sound and music
    this.audioManager?.playSound(SoundEffects.GAME_OVER);
    this.audioManager?.playMusic(MusicTracks.GAME_OVER);
    
    // Show game over effect
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0);
    overlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    gsap.to(overlay, {
      alpha: 0.7,
      duration: 0.5,
      ease: "power2.out"
    });

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        score: this.gameState.score,
        level: this.gameState.level
      });
    });
  }

  public pauseGame(): void {
    if (!this.isPaused) {
      this.isPaused = true;
      this.gameState.isPaused = true;
      this.scene.pause();
      
      // Show pause overlay
      this.scene.launch('PauseOverlay');
    }
  }

  public resumeGame(): void {
    if (this.isPaused) {
      this.isPaused = false;
      this.gameState.isPaused = false;
      this.scene.resume();
      
      // Hide pause overlay
      this.scene.stop('PauseOverlay');
    }
  }

  private togglePause(): void {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  update(): void {
    // Game update logic if needed
  }

  shutdown(): void {
    this.gameGrid?.destroy();
    this.audioManager?.destroy();
    gsap.killTweensOf(this);
  }
}