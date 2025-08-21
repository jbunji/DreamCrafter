export interface PuzzleConfig {
  gridSize: { width: number; height: number };
  gemTypes: number;
  difficulty: number;
  playerProfile: PlayerProfile;
  specialTiles: SpecialTile[];
  seed?: string;
}

export interface PuzzleMetadata {
  id: string;
  difficulty: number;
  signature: string;
  shareCode: string;
  createdAt: Date;
  playerId: string;
  estimatedMoves: number;
  winProbability: number;
}

export interface TrainingData {
  input: number[];
  output: number[];
  metadata?: {
    playerId: string;
    sessionId: string;
    timestamp: Date;
  };
}

export interface MoveAnalysis {
  efficiency: number;
  pattern: Pattern;
  timing: number;
  cascadePotential: number;
  strategicValue: number;
}

export interface AIModel {
  id: string;
  version: string;
  trainedAt: Date;
  accuracy: number;
  iterations: number;
  errorThreshold: number;
  modelData: string;
}

export interface DifficultyMetrics {
  movesRequired: number;
  cascadeFrequency: number;
  specialGemDensity: number;
  blockerCount: number;
  estimatedTime: number;
}

export interface PlayerAdaptation {
  recommendedDifficulty: number;
  suggestedGemTypes: GemType[];
  preferredObjectives: ObjectiveType[];
  powerUpRecommendations: PowerUpType[];
}

export interface PuzzleAnalysis {
  solvable: boolean;
  minimumMoves: number;
  optimalPath: Move[];
  difficultySCore: number;
  bottlenecks: Position[];
}

export interface Move {
  from: Position;
  to: Position;
  score: number;
  resultingMatches: number;
}

import { GemType, ObjectiveType, PowerUpType, Position, SpecialTile } from './game';
import { Pattern, PlayerProfile } from './player';