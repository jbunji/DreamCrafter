import * as brain from 'brain.js';
import type { Pattern, Move, GameState } from '@dreamcrafter/shared-types';
import { normalize } from '../utils/statistics';

export interface PatternFeatures {
  moveDirection: number; // 0-1 (horizontal vs vertical)
  boardPosition: number; // 0-1 (edge to center)
  gemDensity: number; // 0-1 (sparse to dense)
  colorVariety: number; // 0-1 (uniform to diverse)
  cascadePotential: number; // 0-1
  specialGemProximity: number; // 0-1
}

export class PatternRecognitionModel {
  private lstm: brain.recurrent.LSTM;
  private patternHistory: Pattern[] = [];
  private moveSequences: Move[][] = [];

  constructor() {
    this.lstm = new brain.recurrent.LSTM({
      hiddenLayers: [20, 10],
      activation: 'sigmoid',
      learningRate: 0.01
    });
  }

  /**
   * Extract features from a move and game state
   */
  extractFeatures(move: Move, gameState: GameState): PatternFeatures {
    const { from, to } = move;
    const grid = gameState.grid;
    const gridWidth = grid[0].length;
    const gridHeight = grid.length;

    // Move direction (0 = horizontal, 1 = vertical)
    const moveDirection = Math.abs(from.y - to.y);

    // Board position (distance from center)
    const centerX = gridWidth / 2;
    const centerY = gridHeight / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(from.x - centerX, 2) + Math.pow(from.y - centerY, 2)
    );
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    const boardPosition = distanceFromCenter / maxDistance;

    // Gem density around move
    const gemDensity = this.calculateLocalGemDensity(from, grid);

    // Color variety in region
    const colorVariety = this.calculateColorVariety(from, grid);

    // Cascade potential
    const cascadePotential = this.estimateCascadePotential(move, grid);

    // Special gem proximity
    const specialGemProximity = this.calculateSpecialGemProximity(from, grid);

    return {
      moveDirection,
      boardPosition,
      gemDensity,
      colorVariety,
      cascadePotential,
      specialGemProximity
    };
  }

  /**
   * Predict the next likely move pattern
   */
  predictNextPattern(recentMoves: Move[], gameState: GameState): Pattern {
    if (recentMoves.length < 3) {
      return { type: 'random', frequency: 0.25 };
    }

    // Extract features from recent moves
    const features = recentMoves.slice(-5).map(move => 
      this.extractFeatures(move, gameState)
    );

    // Create input sequence for LSTM
    const inputSequence = this.featuresToSequence(features);

    // Predict next pattern
    const prediction = this.lstm.run(inputSequence);
    
    return this.interpretPrediction(prediction as string);
  }

  /**
   * Train the model on player move sequences
   */
  async trainOnSequences(sequences: { moves: Move[]; gameStates: GameState[] }[]): Promise<void> {
    const trainingData: Array<{ input: string; output: string }> = [];

    sequences.forEach(({ moves, gameStates }) => {
      for (let i = 3; i < moves.length; i++) {
        const inputMoves = moves.slice(i - 3, i);
        const targetMove = moves[i];
        
        const inputFeatures = inputMoves.map((move, idx) => 
          this.extractFeatures(move, gameStates[i - 3 + idx])
        );
        
        const targetFeatures = this.extractFeatures(targetMove, gameStates[i]);
        
        trainingData.push({
          input: this.featuresToSequence(inputFeatures),
          output: this.featuresToPattern(targetFeatures)
        });
      }
    });

    // Train LSTM
    await this.lstm.trainAsync(trainingData, {
      iterations: 100,
      errorThresh: 0.05,
      log: false
    });
  }

  /**
   * Calculate local gem density around a position
   */
  private calculateLocalGemDensity(pos: Position, grid: (any | null)[][]): number {
    const radius = 2;
    let gemCount = 0;
    let totalCells = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const y = pos.y + dy;
        const x = pos.x + dx;
        
        if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
          totalCells++;
          if (grid[y][x]) gemCount++;
        }
      }
    }

    return totalCells > 0 ? gemCount / totalCells : 0;
  }

  /**
   * Calculate color variety in a region
   */
  private calculateColorVariety(pos: Position, grid: (any | null)[][]): number {
    const radius = 3;
    const colorSet = new Set<string>();
    let totalGems = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const y = pos.y + dy;
        const x = pos.x + dx;
        
        if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length && grid[y][x]) {
          colorSet.add(grid[y][x].type);
          totalGems++;
        }
      }
    }

    // Normalize by maximum possible colors (6)
    return colorSet.size / 6;
  }

  /**
   * Estimate cascade potential of a move
   */
  private estimateCascadePotential(move: Move, grid: (any | null)[][]): number {
    // Simplified cascade estimation
    // In a real implementation, this would simulate the move
    let potential = 0;
    
    // Check vertical alignment below the move
    const y = Math.max(move.from.y, move.to.y);
    for (let row = y + 1; row < grid.length; row++) {
      if (!grid[row][move.from.x]) {
        potential += 0.1;
      }
    }
    
    return Math.min(1, potential);
  }

  /**
   * Calculate proximity to special gems
   */
  private calculateSpecialGemProximity(pos: Position, grid: (any | null)[][]): number {
    const searchRadius = 4;
    let minDistance = searchRadius;

    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
      for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        const y = pos.y + dy;
        const x = pos.x + dx;
        
        if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
          const gem = grid[y][x];
          if (gem && gem.isSpecial) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            minDistance = Math.min(minDistance, distance);
          }
        }
      }
    }

    return 1 - (minDistance / searchRadius);
  }

  /**
   * Convert features to LSTM input sequence
   */
  private featuresToSequence(features: PatternFeatures[]): string {
    return features.map(f => 
      `${f.moveDirection.toFixed(2)},${f.boardPosition.toFixed(2)},${f.gemDensity.toFixed(2)},${f.colorVariety.toFixed(2)},${f.cascadePotential.toFixed(2)},${f.specialGemProximity.toFixed(2)}`
    ).join(';');
  }

  /**
   * Convert features to pattern string
   */
  private featuresToPattern(features: PatternFeatures): string {
    // Classify based on dominant feature
    if (features.boardPosition > 0.8) return 'corner';
    if (features.boardPosition < 0.3) return 'center';
    if (features.boardPosition > 0.6) return 'edge';
    return 'random';
  }

  /**
   * Interpret LSTM prediction as pattern
   */
  private interpretPrediction(prediction: string): Pattern {
    const patterns = ['corner', 'center', 'edge', 'random'];
    
    // Find closest matching pattern
    let bestMatch = 'random';
    let maxSimilarity = 0;
    
    patterns.forEach(pattern => {
      const similarity = this.calculateStringSimilarity(prediction, pattern);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestMatch = pattern;
      }
    });

    return {
      type: bestMatch as 'corner' | 'center' | 'edge' | 'random',
      frequency: maxSimilarity
    };
  }

  /**
   * Simple string similarity calculation
   */
  private calculateStringSimilarity(s1: string, s2: string): number {
    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1;
    
    let matches = 0;
    const minLen = Math.min(s1.length, s2.length);
    
    for (let i = 0; i < minLen; i++) {
      if (s1[i] === s2[i]) matches++;
    }
    
    return matches / maxLen;
  }

  /**
   * Save the trained model
   */
  toJSON(): string {
    return JSON.stringify({
      lstm: this.lstm.toJSON(),
      patternHistory: this.patternHistory.slice(-100) // Keep last 100 patterns
    });
  }

  /**
   * Load a trained model
   */
  static fromJSON(json: string): PatternRecognitionModel {
    const data = JSON.parse(json);
    const model = new PatternRecognitionModel();
    model.lstm.fromJSON(data.lstm);
    model.patternHistory = data.patternHistory;
    return model;
  }
}