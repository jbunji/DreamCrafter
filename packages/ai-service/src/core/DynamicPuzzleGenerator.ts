import type { 
  PuzzleConfig, 
  Gem, 
  GemType, 
  Position,
  SpecialTile,
  PlayerProfile,
  PuzzleMetadata,
  DifficultyMetrics
} from '@dreamcrafter/shared-types';
import { SkillPredictionModel } from '../models/SkillPredictionModel';
import { DifficultyCalculator } from './DifficultyCalculator';
import { shuffle, random } from 'lodash';

export class DynamicPuzzleGenerator {
  private skillModel: SkillPredictionModel;
  private difficultyCalculator: DifficultyCalculator;
  private gemTypes: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  constructor(skillModel?: SkillPredictionModel) {
    this.skillModel = skillModel || new SkillPredictionModel();
    this.difficultyCalculator = new DifficultyCalculator();
  }

  /**
   * Generate a puzzle tailored to the player's skill level
   */
  async generatePuzzle(config: PuzzleConfig): Promise<{
    grid: (Gem | null)[][];
    metadata: PuzzleMetadata;
  }> {
    const { gridSize, playerProfile } = config;
    
    // Calculate optimal difficulty using AI
    const optimalDifficulty = this.calculateOptimalDifficulty(playerProfile);
    
    // Adjust gem types based on difficulty
    const availableGems = this.selectGemTypes(optimalDifficulty, config.gemTypes);
    
    // Generate initial grid
    let grid = this.createInitialGrid(gridSize, availableGems);
    
    // Apply difficulty adjustments
    grid = this.applyDifficultyModifiers(grid, optimalDifficulty, playerProfile);
    
    // Add special tiles if needed
    if (config.specialTiles && config.specialTiles.length > 0) {
      grid = this.addSpecialTiles(grid, config.specialTiles);
    }
    
    // Ensure puzzle is solvable
    const { solvable, moves } = await this.validatePuzzle(grid);
    if (!solvable) {
      // Regenerate if not solvable
      return this.generatePuzzle(config);
    }
    
    // Calculate puzzle metrics
    const metrics = this.difficultyCalculator.calculateMetrics(grid);
    
    // Generate metadata
    const metadata: PuzzleMetadata = {
      id: this.generatePuzzleId(),
      difficulty: optimalDifficulty,
      signature: `DreamCrafted for ${playerProfile.username}!`,
      shareCode: this.generateShareCode(grid, config),
      createdAt: new Date(),
      playerId: playerProfile.id,
      estimatedMoves: moves,
      winProbability: this.calculateWinProbability(metrics, playerProfile)
    };
    
    return { grid, metadata };
  }

  /**
   * Calculate optimal difficulty based on player profile
   */
  private calculateOptimalDifficulty(profile: PlayerProfile): number {
    // Use AI model if available
    const aiDifficulty = this.skillModel.predictDifficulty(profile);
    
    // Apply bounds and smoothing
    const smoothedDifficulty = this.smoothDifficulty(
      aiDifficulty,
      profile.skillLevel,
      profile.statistics.currentStreak
    );
    
    return Math.max(0.1, Math.min(0.95, smoothedDifficulty));
  }

  /**
   * Smooth difficulty to prevent frustration
   */
  private smoothDifficulty(ai: number, skill: number, streak: number): number {
    // If on a winning streak, gradually increase difficulty
    if (streak > 3) {
      return ai + (streak - 3) * 0.02;
    }
    
    // If struggling (no streak), slightly reduce difficulty
    if (streak === 0) {
      return ai * 0.95;
    }
    
    // Blend AI prediction with current skill level
    return ai * 0.8 + skill * 0.2;
  }

  /**
   * Select gem types based on difficulty
   */
  private selectGemTypes(difficulty: number, requestedTypes: number): GemType[] {
    // Easier puzzles have fewer gem types
    const minTypes = 4;
    const maxTypes = 6;
    const typeCount = Math.floor(minTypes + (maxTypes - minTypes) * difficulty);
    
    return shuffle(this.gemTypes).slice(0, Math.min(typeCount, requestedTypes));
  }

  /**
   * Create initial grid with no immediate matches
   */
  private createInitialGrid(
    size: { width: number; height: number },
    gemTypes: GemType[]
  ): (Gem | null)[][] {
    const grid: (Gem | null)[][] = Array(size.height)
      .fill(null)
      .map(() => Array(size.width).fill(null));
    
    for (let row = 0; row < size.height; row++) {
      for (let col = 0; col < size.width; col++) {
        let gemType: GemType;
        let attempts = 0;
        
        do {
          gemType = gemTypes[random(0, gemTypes.length - 1)];
          attempts++;
        } while (
          this.wouldCreateMatch(grid, col, row, gemType) && 
          attempts < 10
        );
        
        grid[row][col] = {
          id: `gem_${row}_${col}_${Date.now()}`,
          type: gemType,
          position: { x: col, y: row },
          isSpecial: false
        };
      }
    }
    
    return grid;
  }

  /**
   * Check if placing a gem would create an immediate match
   */
  private wouldCreateMatch(
    grid: (Gem | null)[][],
    col: number,
    row: number,
    gemType: GemType
  ): boolean {
    // Check horizontal
    if (col >= 2) {
      const gem1 = grid[row][col - 1];
      const gem2 = grid[row][col - 2];
      if (gem1?.type === gemType && gem2?.type === gemType) {
        return true;
      }
    }
    
    // Check vertical
    if (row >= 2) {
      const gem1 = grid[row - 1][col];
      const gem2 = grid[row - 2][col];
      if (gem1?.type === gemType && gem2?.type === gemType) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Apply difficulty modifiers to the grid
   */
  private applyDifficultyModifiers(
    grid: (Gem | null)[][],
    difficulty: number,
    profile: PlayerProfile
  ): (Gem | null)[][] {
    // Add pre-positioned patterns based on player preferences
    if (profile.preferences.preferredPatterns) {
      grid = this.addPreferredPatterns(grid, profile.preferences.preferredPatterns);
    }
    
    // Adjust gem distribution for difficulty
    if (difficulty > 0.7) {
      // Harder puzzles have more scattered gem types
      grid = this.scatterGems(grid, 0.2);
    } else if (difficulty < 0.3) {
      // Easier puzzles have more clustered gems
      grid = this.clusterGems(grid, 0.3);
    }
    
    return grid;
  }

  /**
   * Add player's preferred patterns to increase engagement
   */
  private addPreferredPatterns(
    grid: (Gem | null)[][],
    patterns: any[]
  ): (Gem | null)[][] {
    // Implementation for adding L-shapes, T-shapes, etc.
    // Based on player's historical preferences
    return grid;
  }

  /**
   * Scatter gems to increase difficulty
   */
  private scatterGems(grid: (Gem | null)[][], factor: number): (Gem | null)[][] {
    const height = grid.length;
    const width = grid[0].length;
    const swapCount = Math.floor(height * width * factor);
    
    for (let i = 0; i < swapCount; i++) {
      const pos1 = {
        row: random(0, height - 1),
        col: random(0, width - 1)
      };
      const pos2 = {
        row: random(0, height - 1),
        col: random(0, width - 1)
      };
      
      // Swap gems
      const temp = grid[pos1.row][pos1.col];
      grid[pos1.row][pos1.col] = grid[pos2.row][pos2.col];
      grid[pos2.row][pos2.col] = temp;
      
      // Update positions
      if (grid[pos1.row][pos1.col]) {
        grid[pos1.row][pos1.col]!.position = { x: pos1.col, y: pos1.row };
      }
      if (grid[pos2.row][pos2.col]) {
        grid[pos2.row][pos2.col]!.position = { x: pos2.col, y: pos2.row };
      }
    }
    
    return grid;
  }

  /**
   * Cluster similar gems to decrease difficulty
   */
  private clusterGems(grid: (Gem | null)[][], factor: number): (Gem | null)[][] {
    // Group similar gems together
    // This makes matches easier to spot
    return grid;
  }

  /**
   * Add special tiles (blockers, ice, etc.)
   */
  private addSpecialTiles(
    grid: (Gem | null)[][],
    specialTiles: SpecialTile[]
  ): (Gem | null)[][] {
    specialTiles.forEach(tile => {
      const { x, y } = tile.position;
      if (grid[y] && grid[y][x]) {
        // Mark position as having a special tile
        // In real implementation, this would modify the tile properties
      }
    });
    
    return grid;
  }

  /**
   * Validate that the puzzle is solvable
   */
  private async validatePuzzle(
    grid: (Gem | null)[][]
  ): Promise<{ solvable: boolean; moves: number }> {
    // Simple validation - check if there's at least one possible move
    const possibleMoves = this.findAllPossibleMoves(grid);
    
    return {
      solvable: possibleMoves.length > 0,
      moves: possibleMoves.length
    };
  }

  /**
   * Find all possible moves in the current grid
   */
  private findAllPossibleMoves(grid: (Gem | null)[][]): Position[] {
    const moves: Position[] = [];
    const height = grid.length;
    const width = grid[0].length;
    
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        // Check horizontal swap
        if (col < width - 1) {
          if (this.checkMoveCreatesMatch(grid, { x: col, y: row }, { x: col + 1, y: row })) {
            moves.push({ x: col, y: row });
          }
        }
        
        // Check vertical swap
        if (row < height - 1) {
          if (this.checkMoveCreatesMatch(grid, { x: col, y: row }, { x: col, y: row + 1 })) {
            moves.push({ x: col, y: row });
          }
        }
      }
    }
    
    return moves;
  }

  /**
   * Check if a move would create a match
   */
  private checkMoveCreatesMatch(
    grid: (Gem | null)[][],
    pos1: Position,
    pos2: Position
  ): boolean {
    // Create a copy and simulate the swap
    const testGrid = grid.map(row => [...row]);
    const temp = testGrid[pos1.y][pos1.x];
    testGrid[pos1.y][pos1.x] = testGrid[pos2.y][pos2.x];
    testGrid[pos2.y][pos2.x] = temp;
    
    // Check if either position now has a match
    return (
      this.hasMatchAt(testGrid, pos1.x, pos1.y) ||
      this.hasMatchAt(testGrid, pos2.x, pos2.y)
    );
  }

  /**
   * Check if there's a match at a specific position
   */
  private hasMatchAt(grid: (Gem | null)[][], col: number, row: number): boolean {
    const gem = grid[row][col];
    if (!gem) return false;
    
    const gemType = gem.type;
    
    // Check horizontal
    let horizontalCount = 1;
    // Check left
    for (let c = col - 1; c >= 0 && grid[row][c]?.type === gemType; c--) {
      horizontalCount++;
    }
    // Check right
    for (let c = col + 1; c < grid[0].length && grid[row][c]?.type === gemType; c++) {
      horizontalCount++;
    }
    
    if (horizontalCount >= 3) return true;
    
    // Check vertical
    let verticalCount = 1;
    // Check up
    for (let r = row - 1; r >= 0 && grid[r][col]?.type === gemType; r--) {
      verticalCount++;
    }
    // Check down
    for (let r = row + 1; r < grid.length && grid[r][col]?.type === gemType; r++) {
      verticalCount++;
    }
    
    return verticalCount >= 3;
  }

  /**
   * Calculate win probability based on metrics and player profile
   */
  private calculateWinProbability(
    metrics: DifficultyMetrics,
    profile: PlayerProfile
  ): number {
    const baseProb = 0.75; // Target 75% win rate
    
    // Adjust based on player skill vs puzzle difficulty
    const skillFactor = profile.skillLevel / metrics.difficultySCore;
    
    // Factor in player's recent performance
    const performanceFactor = profile.performance.successRate;
    
    return Math.max(0.5, Math.min(0.95, baseProb * skillFactor * performanceFactor));
  }

  /**
   * Generate unique puzzle ID
   */
  private generatePuzzleId(): string {
    return `puzzle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate shareable puzzle code
   */
  private generateShareCode(grid: (Gem | null)[][], config: PuzzleConfig): string {
    // Simple encoding - in production this would be more sophisticated
    const data = {
      size: config.gridSize,
      gems: grid.flat().map(g => g?.type || 'null').join(''),
      difficulty: config.difficulty
    };
    
    return Buffer.from(JSON.stringify(data)).toString('base64').substr(0, 8);
  }
}