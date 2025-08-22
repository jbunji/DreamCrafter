import * as Phaser from 'phaser';
import { GameGrid } from '../systems/GameGrid';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import type { GameState, PlayerProfile, MoveResult } from '@dreamcrafter/shared-types';
import { SoundEffects, MusicTracks } from '@dreamcrafter/shared-types';
import { AudioManager } from '../audio/AudioManager';
import { PremiumBackgroundRenderer } from '../graphics/PremiumBackgroundRenderer';
import { AdvancedParticleSystem } from '../graphics/AdvancedParticleSystem';
import { gsap } from 'gsap';

export class GameScene extends Phaser.Scene {
  private gameGrid?: GameGrid;
  private scoreText?: Phaser.GameObjects.Text;
  private movesText?: Phaser.GameObjects.Text;
  private levelText?: Phaser.GameObjects.Text;
  private gameState: GameState;
  private isPaused: boolean = false;
  private audioManager?: AudioManager;
  private backgroundRenderer?: PremiumBackgroundRenderer;
  private particleSystem?: AdvancedParticleSystem;

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
    this.backgroundRenderer = new PremiumBackgroundRenderer(this);
    this.particleSystem = new AdvancedParticleSystem(this);
    
    this.createPremiumBackground();
    this.createEnhancedUI();
    this.createGameGrid();
    this.setupInputHandling();
    this.animateSceneEntry();
    
    // Start gameplay music
    this.audioManager.playMusic(MusicTracks.GAMEPLAY_CALM);
  }

  private createPremiumBackground(): void {
    // Create a clean gradient background
    const graphics = this.add.graphics();
    
    // Simple two-tone gradient
    const colors = [0x1e3a5f, 0x0f1e3d];
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
    
    // Create game board background
    this.createGameBoard();
  }
  
  private createGameBoard(): void {
    const boardX = 40;
    const boardY = 380;
    const tileSize = 100;
    const boardPadding = 20;
    
    // Board background
    const boardBg = this.add.graphics();
    boardBg.fillStyle(0x0a0a0a, 0.8);
    boardBg.fillRoundedRect(
      boardX - boardPadding, 
      boardY - boardPadding, 
      9 * tileSize + boardPadding * 2, 
      9 * tileSize + boardPadding * 2, 
      20
    );
    
    // Board border
    boardBg.lineStyle(4, 0x2a4d69, 1);
    boardBg.strokeRoundedRect(
      boardX - boardPadding, 
      boardY - boardPadding, 
      9 * tileSize + boardPadding * 2, 
      9 * tileSize + boardPadding * 2, 
      20
    );
    
    // Create checkered pattern with premium tiles
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const x = boardX + col * tileSize;
        const y = boardY + row * tileSize;
        const isDark = (row + col) % 2 === 0;
        
        const tileName = isDark ? 'board_tile_dark' : 'board_tile_light';
        const tile = this.add.image(x + tileSize / 2, y + tileSize / 2, tileName);
        tile.setScale(0.9);
        tile.setAlpha(0.7);
      }
    }
  }

  private createEnhancedUI(): void {
    // Score panel
    this.add.text(100, 40, 'SCORE', {
      fontSize: '22px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    });
    
    this.scoreText = this.add.text(100, 70, '0', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    });

    // Moves panel
    this.add.text(GAME_WIDTH / 2, 40, 'MOVES', {
      fontSize: '22px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.movesText = this.add.text(GAME_WIDTH / 2, 70, '30', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Level panel
    this.add.text(GAME_WIDTH - 200, 40, 'LEVEL', {
      fontSize: '22px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.levelText = this.add.text(GAME_WIDTH - 200, 70, '1', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Clean pause button
    this.createCleanPauseButton();

    // Update UI with current state
    this.updateUI();
  }

  private createCleanPauseButton(): void {
    const pauseButton = this.add.container(GAME_WIDTH - 100, 200);
    
    // Clean circular button background
    const pauseBg = this.add.graphics();
    pauseBg.fillStyle(0x9c27b0, 1);
    pauseBg.fillCircle(0, 0, 40);
    
    // Inner circle
    pauseBg.fillStyle(0xab47bc, 0.5);
    pauseBg.fillCircle(0, 0, 35);
    
    // Border
    pauseBg.lineStyle(3, 0x6a1b9a, 1);
    pauseBg.strokeCircle(0, 0, 40);
    
    // Pause icon (two vertical bars)
    const pauseIcon = this.add.graphics();
    pauseIcon.fillStyle(0xffffff, 1);
    pauseIcon.fillRoundedRect(-12, -15, 8, 30, 3);
    pauseIcon.fillRoundedRect(4, -15, 8, 30, 3);
    
    pauseButton.add([pauseBg, pauseIcon]);
    pauseButton.setSize(80, 80);
    pauseButton.setInteractive({ useHandCursor: true });

    // Hover effects
    pauseButton.on('pointerover', () => {
      gsap.to(pauseButton, { scale: 1.1, duration: 0.2 });
    });

    pauseButton.on('pointerout', () => {
      gsap.to(pauseButton, { scale: 1, duration: 0.2 });
    });

    pauseButton.on('pointerdown', () => {
      this.audioManager?.playSound(SoundEffects.BUTTON_CLICK);
      gsap.to(pauseButton, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
      this.togglePause();
    });
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
      this.createAdvancedMatchEffect(gem.x, gem.y, gem.gemData?.type || 'red');
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
      this.showEnhancedCascadeBonus(result.cascades);
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

  private createAdvancedMatchEffect(x: number, y: number, gemType: string): void {
    // Create clean sparkle effect instead of heavy particles
    const sparkleCount = 8;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const distance = 30;
      const sparkle = this.add.image(x, y, 'sparkle_clean');
      sparkle.setScale(0.5 + Math.random() * 0.5);
      sparkle.setAlpha(0.8);
      
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      
      gsap.to(sparkle, {
        x: targetX,
        y: targetY,
        scale: 0,
        alpha: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => sparkle.destroy()
      });
    }
    
    // Add a central glow
    const glow = this.add.image(x, y, 'glow_orb_clean');
    glow.setScale(0.5);
    glow.setAlpha(0.6);
    glow.setTint(this.getGemColor(gemType));
    
    gsap.to(glow, {
      scale: 1.5,
      alpha: 0,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => glow.destroy()
    });
  }

  private getGemColor(gemType: string): number {
    const colors: { [key: string]: number } = {
      red: 0xff1744,
      blue: 0x2196f3,
      green: 0x4caf50,
      yellow: 0xffc107,
      purple: 0x9c27b0,
      orange: 0xff6f00
    };
    return colors[gemType] || 0xffffff;
  }

  private showEnhancedCascadeBonus(cascades: number): void {
    const messages = ['SWEET!', 'TASTY!', 'DIVINE!', 'DELICIOUS!', 'SUGAR RUSH!'];
    const message = cascades >= messages.length ? messages[messages.length - 1] : messages[cascades - 1];
    
    const bonusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
      fontSize: '64px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#ff6f00',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Simple clean animation
    gsap.fromTo(bonusText, 
      { scale: 0, alpha: 0 },
      { 
        scale: 1.5, 
        alpha: 1,
        duration: 0.4,
        ease: "back.out(1.7)",
        onComplete: () => {
          gsap.to(bonusText, {
            scale: 0.8,
            alpha: 0,
            y: '-=100',
            duration: 0.6,
            delay: 0.5,
            ease: "power2.in",
            onComplete: () => bonusText.destroy()
          });
        }
      }
    );

    // Add sparkles around text
    const sparkleCount = 6;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const distance = 100;
      const sparkle = this.add.image(
        GAME_WIDTH / 2 + Math.cos(angle) * distance,
        GAME_HEIGHT / 2 + Math.sin(angle) * distance,
        'sparkle_clean'
      );
      sparkle.setScale(0);
      
      gsap.to(sparkle, {
        scale: 1,
        alpha: 0,
        duration: 1,
        delay: i * 0.1,
        ease: 'power2.out',
        onComplete: () => sparkle.destroy()
      });
    }
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
    this.backgroundRenderer?.destroy();
    this.particleSystem?.destroy();
    gsap.killTweensOf(this);
  }
}