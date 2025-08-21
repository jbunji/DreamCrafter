import type { Gem, DifficultyMetrics, Position } from '@dreamcrafter/shared-types';

export class DifficultyCalculator {
  /**
   * Calculate comprehensive difficulty metrics for a puzzle
   */
  calculateMetrics(grid: (Gem | null)[][]): DifficultyMetrics {
    const possibleMoves = this.countPossibleMoves(grid);
    const cascadePotential = this.calculateCascadePotential(grid);
    const gemDistribution = this.analyzeGemDistribution(grid);
    const bottlenecks = this.findBottlenecks(grid);
    
    // Calculate overall difficulty score
    const difficultyScore = this.calculateDifficultyScore({
      possibleMoves,
      cascadePotential,
      gemDistribution,
      bottleneckCount: bottlenecks.length
    });
    
    return {
      movesRequired: Math.max(10, Math.floor(possibleMoves * 0.7)),
      cascadeFrequency: cascadePotential,
      specialGemDensity: 0, // Will be calculated when special gems are added
      blockerCount: 0, // Will be calculated when blockers are added
      estimatedTime: this.estimateCompletionTime(difficultyScore),
      difficultySCore: difficultyScore
    };
  }

  /**
   * Count all possible moves in the current grid state
   */
  private countPossibleMoves(grid: (Gem | null)[][]): number {
    let moveCount = 0;
    const height = grid.length;
    const width = grid[0].length;
    
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        // Check horizontal swap
        if (col < width - 1) {
          if (this.wouldCreateMatch(grid, { x: col, y: row }, { x: col + 1, y: row })) {
            moveCount++;
          }
        }
        
        // Check vertical swap
        if (row < height - 1) {
          if (this.wouldCreateMatch(grid, { x: col, y: row }, { x: col, y: row + 1 })) {
            moveCount++;
          }
        }
      }
    }
    
    return moveCount;
  }

  /**
   * Calculate the potential for cascading matches
   */
  private calculateCascadePotential(grid: (Gem | null)[][]): number {
    let cascadePotential = 0;
    const height = grid.length;
    const width = grid[0].length;
    
    // Check for vertical alignments that could cascade
    for (let col = 0; col < width; col++) {
      let sameColorCount = 1;
      let currentType = grid[0][col]?.type;
      
      for (let row = 1; row < height; row++) {
        if (grid[row][col]?.type === currentType) {
          sameColorCount++;
        } else {
          if (sameColorCount >= 2) {
            cascadePotential += (sameColorCount - 1) * 0.1;
          }
          sameColorCount = 1;
          currentType = grid[row][col]?.type;
        }
      }
      
      if (sameColorCount >= 2) {
        cascadePotential += (sameColorCount - 1) * 0.1;
      }
    }
    
    return Math.min(1, cascadePotential);
  }

  /**
   * Analyze gem distribution for difficulty assessment
   */
  private analyzeGemDistribution(grid: (Gem | null)[][]): number {
    const gemCounts: Record<string, number> = {};
    let totalGems = 0;
    
    // Count each gem type
    grid.forEach(row => {
      row.forEach(gem => {
        if (gem) {
          gemCounts[gem.type] = (gemCounts[gem.type] || 0) + 1;
          totalGems++;
        }
      });
    });
    
    // Calculate distribution evenness (0 = perfectly even, 1 = highly uneven)
    const gemTypes = Object.keys(gemCounts);
    const idealCount = totalGems / gemTypes.length;
    
    let variance = 0;
    gemTypes.forEach(type => {
      const diff = gemCounts[type] - idealCount;
      variance += (diff * diff);
    });
    
    const standardDeviation = Math.sqrt(variance / gemTypes.length);
    const normalizedDeviation = standardDeviation / idealCount;
    
    return Math.min(1, normalizedDeviation);
  }

  /**
   * Find bottleneck positions where moves are limited
   */
  private findBottlenecks(grid: (Gem | null)[][]): Position[] {
    const bottlenecks: Position[] = [];
    const height = grid.length;
    const width = grid[0].length;
    
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const movesFromPosition = this.countMovesFromPosition(grid, { x: col, y: row });
        
        // Position is a bottleneck if it has very few available moves
        if (movesFromPosition <= 1) {
          bottlenecks.push({ x: col, y: row });
        }
      }
    }
    
    return bottlenecks;
  }

  /**
   * Count possible moves from a specific position
   */
  private countMovesFromPosition(grid: (Gem | null)[][], pos: Position): number {
    let moves = 0;
    
    // Check all four directions
    const directions = [
      { dx: 1, dy: 0 },  // Right
      { dx: -1, dy: 0 }, // Left
      { dx: 0, dy: 1 },  // Down
      { dx: 0, dy: -1 }  // Up
    ];
    
    directions.forEach(({ dx, dy }) => {
      const newPos = { x: pos.x + dx, y: pos.y + dy };
      
      if (this.isValidPosition(grid, newPos)) {
        if (this.wouldCreateMatch(grid, pos, newPos)) {
          moves++;
        }
      }
    });
    
    return moves;
  }

  /**
   * Check if a position is valid within the grid
   */
  private isValidPosition(grid: (Gem | null)[][], pos: Position): boolean {
    return pos.y >= 0 && pos.y < grid.length && 
           pos.x >= 0 && pos.x < grid[0].length;
  }

  /**
   * Check if swapping two positions would create a match
   */
  private wouldCreateMatch(grid: (Gem | null)[][], pos1: Position, pos2: Position): boolean {
    // Create a copy and simulate the swap
    const testGrid = grid.map(row => [...row]);
    const temp = testGrid[pos1.y][pos1.x];
    testGrid[pos1.y][pos1.x] = testGrid[pos2.y][pos2.x];
    testGrid[pos2.y][pos2.x] = temp;
    
    // Check both positions for matches
    return this.hasMatchAt(testGrid, pos1) || this.hasMatchAt(testGrid, pos2);
  }

  /**
   * Check if there's a match at a specific position
   */
  private hasMatchAt(grid: (Gem | null)[][], pos: Position): boolean {
    const gem = grid[pos.y][pos.x];
    if (!gem) return false;
    
    const gemType = gem.type;
    
    // Check horizontal match
    let horizontalCount = 1;
    
    // Check left
    for (let x = pos.x - 1; x >= 0 && grid[pos.y][x]?.type === gemType; x--) {
      horizontalCount++;
    }
    
    // Check right
    for (let x = pos.x + 1; x < grid[0].length && grid[pos.y][x]?.type === gemType; x++) {
      horizontalCount++;
    }
    
    if (horizontalCount >= 3) return true;
    
    // Check vertical match
    let verticalCount = 1;
    
    // Check up
    for (let y = pos.y - 1; y >= 0 && grid[y][pos.x]?.type === gemType; y--) {
      verticalCount++;
    }
    
    // Check down
    for (let y = pos.y + 1; y < grid.length && grid[y][pos.x]?.type === gemType; y++) {
      verticalCount++;
    }
    
    return verticalCount >= 3;
  }

  /**
   * Calculate overall difficulty score (0-1)
   */
  private calculateDifficultyScore(metrics: {
    possibleMoves: number;
    cascadePotential: number;
    gemDistribution: number;
    bottleneckCount: number;
  }): number {
    // Fewer moves = harder
    const movesDifficulty = Math.max(0, 1 - (metrics.possibleMoves / 20));
    
    // Less cascade potential = harder
    const cascadeDifficulty = 1 - metrics.cascadePotential;
    
    // More uneven distribution = harder
    const distributionDifficulty = metrics.gemDistribution;
    
    // More bottlenecks = harder
    const bottleneckDifficulty = Math.min(1, metrics.bottleneckCount / 10);
    
    // Weighted average
    return (
      movesDifficulty * 0.4 +
      cascadeDifficulty * 0.3 +
      distributionDifficulty * 0.2 +
      bottleneckDifficulty * 0.1
    );
  }

  /**
   * Estimate completion time based on difficulty
   */
  private estimateCompletionTime(difficultyScore: number): number {
    // Base time of 60 seconds, scaling up to 300 seconds for hardest puzzles
    const baseTime = 60;
    const maxTime = 300;
    
    return Math.floor(baseTime + (maxTime - baseTime) * difficultyScore);
  }
}