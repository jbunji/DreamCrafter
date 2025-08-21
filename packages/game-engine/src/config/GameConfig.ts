import * as Phaser from 'phaser';
import { GemShaderPipeline } from '../shaders/GemShaderPipeline';
import { GlowShaderPipeline } from '../shaders/GlowShaderPipeline';

export const GAME_WIDTH = 1080;
export const GAME_HEIGHT = 1920;
export const GRID_ROWS = 9;
export const GRID_COLS = 9;
export const GEM_SIZE = 100;
export const GRID_OFFSET_X = (GAME_WIDTH - (GRID_COLS * GEM_SIZE)) / 2;
export const GRID_OFFSET_Y = 400;

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  antialias: true,
  roundPixels: false,
  powerPreference: 'high-performance',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game-container',
  },
  render: {
    mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
    antialiasGL: true,
    batchSize: 4096,
    maxTextures: 8,
    maxLights: 10,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  pipeline: {
    GemShader: GemShaderPipeline,
    GlowShader: GlowShaderPipeline,
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  audio: {
    disableWebAudio: false,
  },
};