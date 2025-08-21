import * as Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { PreloadScene } from '../scenes/PreloadScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { GameScene } from '../scenes/GameScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { EventEmitter } from 'eventemitter3';
import type { GameState, PlayerProfile } from '@dreamcrafter/shared-types';

export interface DreamCrafterGameOptions {
  parent?: string | HTMLElement;
  playerProfile?: PlayerProfile;
  onStateChange?: (state: GameState) => void;
}

export class DreamCrafterGame extends EventEmitter {
  private game: Phaser.Game;
  private playerProfile?: PlayerProfile;
  private currentState?: GameState;

  constructor(options: DreamCrafterGameOptions = {}) {
    super();

    this.playerProfile = options.playerProfile;

    const config = {
      ...GameConfig,
      parent: options.parent || 'game-container',
      scene: [PreloadScene, MainMenuScene, GameScene, GameOverScene],
    };

    this.game = new Phaser.Game(config);

    // Set up global event listeners
    this.setupEventListeners();

    if (options.onStateChange) {
      this.on('stateChange', options.onStateChange);
    }
  }

  private setupEventListeners(): void {
    this.game.events.on('ready', () => {
      this.emit('ready');
    });

    this.game.events.on('destroy', () => {
      this.emit('destroy');
    });
  }

  public updatePlayerProfile(profile: PlayerProfile): void {
    this.playerProfile = profile;
    this.emit('profileUpdate', profile);
  }

  public getPlayerProfile(): PlayerProfile | undefined {
    return this.playerProfile;
  }

  public startGame(level: number = 1): void {
    const gameScene = this.game.scene.getScene('GameScene') as GameScene;
    if (gameScene) {
      this.game.scene.start('GameScene', { level, playerProfile: this.playerProfile });
    }
  }

  public pauseGame(): void {
    const gameScene = this.game.scene.getScene('GameScene') as GameScene;
    if (gameScene && gameScene.scene.isActive()) {
      gameScene.pauseGame();
      this.emit('gamePaused');
    }
  }

  public resumeGame(): void {
    const gameScene = this.game.scene.getScene('GameScene') as GameScene;
    if (gameScene && gameScene.scene.isActive()) {
      gameScene.resumeGame();
      this.emit('gameResumed');
    }
  }

  public destroy(): void {
    this.removeAllListeners();
    this.game.destroy(true);
  }

  public getGameInstance(): Phaser.Game {
    return this.game;
  }

  public updateGameState(state: Partial<GameState>): void {
    this.currentState = { ...this.currentState, ...state } as GameState;
    this.emit('stateChange', this.currentState);
  }

  public getGameState(): GameState | undefined {
    return this.currentState;
  }
}