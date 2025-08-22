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
    this.backgroundRenderer?.createDynamicBackground(GAME_WIDTH, GAME_HEIGHT);
    this.backgroundRenderer?.createGameBoardFrame(40, 380, 1000, 900);
  }

  private createEnhancedUI(): void {
    this.backgroundRenderer?.createUIElements();

    // Enhanced Score with glow effect
    this.add.text(70, 65, 'SCORE', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#4a90e2',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.scoreText = this.add.text(70, 90, '0', {
      fontSize: '42px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#4a90e2',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    });

    // Enhanced Moves counter
    this.add.text(GAME_WIDTH / 2, 65, 'MOVES', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#ff6b47',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0);

    this.movesText = this.add.text(GAME_WIDTH / 2, 90, '30', {
      fontSize: '42px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#ff6b47',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5, 0);

    // Enhanced Level indicator
    this.add.text(GAME_WIDTH - 120, 65, 'LEVEL', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#2ed573',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0);

    this.levelText = this.add.text(GAME_WIDTH - 120, 90, '1', {
      fontSize: '42px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#2ed573',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5, 0);

    // Enhanced pause button with glow
    this.createEnhancedPauseButton();

    // Update UI with current state
    this.updateUI();
  }

  private createEnhancedPauseButton(): void {
    const pauseButton = this.add.container(GAME_WIDTH - 100, 200);
    
    // Glowing background
    const pauseBg = this.add.graphics();
    pauseBg.fillGradientStyle(0x4a90e2, 0x4a90e2, 0x74b9ff, 0x74b9ff, 1);
    pauseBg.fillCircle(0, 0, 45);
    
    // Inner circle
    pauseBg.fillStyle(0x2d3748, 0.8);
    pauseBg.fillCircle(0, 0, 35);
    
    // Glow effect
    pauseBg.lineStyle(4, 0x4a90e2, 0.6);
    pauseBg.strokeCircle(0, 0, 50);
    
    const pauseIcon = this.add.text(0, 0, '⏸', {
      fontSize: '28px',
      color: '#ffffff',
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#000000',
        blur: 3,
        fill: true
      }
    }).setOrigin(0.5);

    pauseButton.add([pauseBg, pauseIcon]);
    pauseButton.setSize(100, 100);
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
      this.particleSystem?.createCascadeEffect(GAME_WIDTH / 2, GAME_HEIGHT / 2, result.cascades);
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
    this.particleSystem?.createGemMatchExplosion(x, y, gemType);
  }

  private showEnhancedCascadeBonus(cascades: number): void {
    const bonusText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `${cascades}x CASCADE!`, {
      fontSize: '72px',
      fontFamily: 'Arial Black',
      color: '#ffffff',
      stroke: '#ffd700',
      strokeThickness: 10,
      shadow: {
        offsetX: 0,
        offsetY: 6,
        color: '#000000',
        blur: 15,
        fill: true
      }
    }).setOrigin(0.5);

    // Add background glow
    const glowBg = this.add.graphics();
    glowBg.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    glowBg.fillStyle(0xffd700, 0.3);
    glowBg.fillCircle(0, 0, 200);

    gsap.fromTo(bonusText, 
      { scale: 0, rotation: -0.3, alpha: 0 },
      { 
        scale: 1.8, 
        rotation: 0.3,
        alpha: 1,
        duration: 0.6,
        ease: "back.out(2)",
        onComplete: () => {
          gsap.to(bonusText, {
            scale: 0,
            alpha: 0,
            y: '-=150',
            duration: 0.8,
            delay: 0.8,
            ease: "power3.in",
            onComplete: () => bonusText.destroy()
          });
        }
      }
    );

    gsap.fromTo(glowBg,
      { scale: 0, alpha: 0.3 },
      {
        scale: 1.5,
        alpha: 0,
        duration: 1.4,
        ease: "power2.out",
        onComplete: () => glowBg.destroy()
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
    this.backgroundRenderer?.destroy();
    this.particleSystem?.destroy();
    gsap.killTweensOf(this);
  }
}