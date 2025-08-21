import type { 
  PlayerProfile, 
  MoveAnalysis, 
  Move, 
  GameState,
  Pattern,
  PlayStyle,
  PlayerPerformance
} from '@dreamcrafter/shared-types';
import { mean, standardDeviation } from '../utils/statistics';

export class PlayerAnalyzer {
  private readonly LEARNING_WINDOW = 20; // Number of games to analyze
  private readonly SKILL_DECAY_RATE = 0.05; // How quickly skill estimates decay
  private moveHistory: MoveAnalysis[] = [];
  private gameHistory: GameState[] = [];

  /**
   * Analyze a player's move and return insights
   */
  analyzeMove(move: Move, gameState: GameState, timeTaken: number): MoveAnalysis {
    const efficiency = this.calculateMoveEfficiency(move, gameState);
    const pattern = this.detectPattern(move, gameState);
    const cascadePotential = this.predictCascades(move, gameState);
    const strategicValue = this.calculateStrategicValue(move, gameState);

    const analysis: MoveAnalysis = {
      efficiency,
      pattern,
      timing: timeTaken,
      cascadePotential,
      strategicValue
    };

    this.moveHistory.push(analysis);
    return analysis;
  }

  /**
   * Update player profile based on recent performance
   */
  updateProfile(player: PlayerProfile, recentMoves: MoveAnalysis[]): PlayerProfile {
    const updatedProfile = { ...player };

    // Update skill level using exponential moving average
    const recentSkill = this.calculateRecentSkillLevel(recentMoves);
    updatedProfile.skillLevel = 
      player.skillLevel * (1 - this.SKILL_DECAY_RATE) + 
      recentSkill * this.SKILL_DECAY_RATE;

    // Detect play style changes
    updatedProfile.playStyle = this.classifyPlayStyle(recentMoves, player.playStyle);

    // Update performance metrics
    updatedProfile.performance = this.updatePerformanceMetrics(
      player.performance,
      recentMoves
    );

    // Update preferences based on move patterns
    updatedProfile.preferences = this.updatePreferences(
      player.preferences,
      recentMoves
    );

    return updatedProfile;
  }

  /**
   * Calculate move efficiency (0-1)
   */
  private calculateMoveEfficiency(move: Move, gameState: GameState): number {
    // Factors for efficiency:
    // 1. Points per move
    // 2. Progress toward objectives
    // 3. Setup for future moves
    // 4. Use of special gems

    let efficiency = 0;

    // Base efficiency from score
    const averageScorePerMove = 100; // Baseline
    const moveScore = this.estimateMoveScore(move, gameState);
    efficiency += Math.min(1, moveScore / (averageScorePerMove * 2)) * 0.4;

    // Objective progress
    const objectiveProgress = this.calculateObjectiveProgress(move, gameState);
    efficiency += objectiveProgress * 0.3;

    // Future move potential
    const futurePotential = this.calculateFuturePotential(move, gameState);
    efficiency += futurePotential * 0.2;

    // Special gem usage
    const specialUsage = this.evaluateSpecialGemUsage(move, gameState);
    efficiency += specialUsage * 0.1;

    return Math.min(1, efficiency);
  }

  /**
   * Detect pattern in player's move
   */
  private detectPattern(move: Move, gameState: GameState): Pattern {
    const { from, to } = move;
    const gridCenter = {
      x: Math.floor(gameState.grid[0].length / 2),
      y: Math.floor(gameState.grid.length / 2)
    };

    // Determine if move is in corner, edge, or center
    const fromDistance = Math.sqrt(
      Math.pow(from.x - gridCenter.x, 2) + 
      Math.pow(from.y - gridCenter.y, 2)
    );

    const maxDistance = Math.sqrt(
      Math.pow(gridCenter.x, 2) + 
      Math.pow(gridCenter.y, 2)
    );

    const relativeDistance = fromDistance / maxDistance;

    let type: 'corner' | 'center' | 'edge' | 'random';
    if (relativeDistance > 0.8) {
      type = 'corner';
    } else if (relativeDistance < 0.3) {
      type = 'center';
    } else if (
      from.x === 0 || from.x === gameState.grid[0].length - 1 ||
      from.y === 0 || from.y === gameState.grid.length - 1
    ) {
      type = 'edge';
    } else {
      type = 'random';
    }

    // Track pattern frequency
    const frequency = this.calculatePatternFrequency(type);

    return { type, frequency };
  }

  /**
   * Predict cascade potential of a move
   */
  private predictCascades(move: Move, gameState: GameState): number {
    // Simulate the move and count potential cascades
    const simulatedGrid = this.simulateMove(gameState.grid, move);
    
    // Count gems that would fall
    let fallingGems = 0;
    for (let col = 0; col < simulatedGrid[0].length; col++) {
      let emptySpaces = 0;
      for (let row = simulatedGrid.length - 1; row >= 0; row--) {
        if (!simulatedGrid[row][col]) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          fallingGems++;
        }
      }
    }

    // Higher falling gems = higher cascade potential
    return Math.min(1, fallingGems / 20);
  }

  /**
   * Calculate strategic value of a move
   */
  private calculateStrategicValue(move: Move, gameState: GameState): number {
    let value = 0;

    // Setting up special gem combinations
    if (this.createsSpecialGemOpportunity(move, gameState)) {
      value += 0.3;
    }

    // Blocking opponent in multiplayer (future feature)
    // value += this.calculateBlockingValue(move, gameState) * 0.2;

    // Creating multiple match opportunities
    const matchOpportunities = this.countMatchOpportunities(move, gameState);
    value += Math.min(0.4, matchOpportunities * 0.1);

    // Clearing difficult areas
    if (this.clearsBottleneck(move, gameState)) {
      value += 0.3;
    }

    return Math.min(1, value);
  }

  /**
   * Calculate recent skill level from moves
   */
  private calculateRecentSkillLevel(moves: MoveAnalysis[]): number {
    if (moves.length === 0) return 0.5;

    const weights = {
      efficiency: 0.4,
      timing: 0.2,
      strategic: 0.3,
      consistency: 0.1
    };

    // Average efficiency
    const avgEfficiency = mean(moves.map(m => m.efficiency));

    // Timing score (faster is better, normalized)
    const avgTiming = mean(moves.map(m => m.timing));
    const timingScore = Math.max(0, 1 - (avgTiming / 5000)); // 5 seconds as baseline

    // Strategic play
    const avgStrategic = mean(moves.map(m => m.strategicValue));

    // Consistency (lower variance is better)
    const efficiencyStdDev = standardDeviation(moves.map(m => m.efficiency));
    const consistency = Math.max(0, 1 - efficiencyStdDev);

    return (
      avgEfficiency * weights.efficiency +
      timingScore * weights.timing +
      avgStrategic * weights.strategic +
      consistency * weights.consistency
    );
  }

  /**
   * Classify play style based on move patterns
   */
  private classifyPlayStyle(moves: MoveAnalysis[], currentStyle: PlayStyle): PlayStyle {
    if (moves.length < 10) return currentStyle;

    // Analyze move characteristics
    const avgTiming = mean(moves.map(m => m.timing));
    const avgEfficiency = mean(moves.map(m => m.efficiency));
    const avgStrategic = mean(moves.map(m => m.strategicValue));
    const avgCascades = mean(moves.map(m => m.cascadePotential));

    // Fast timing + lower efficiency = fast_paced
    if (avgTiming < 2000 && avgEfficiency < 0.7) {
      return 'fast_paced';
    }

    // High strategic value + high efficiency = strategic
    if (avgStrategic > 0.7 && avgEfficiency > 0.8) {
      return 'strategic';
    }

    // High cascade focus = competitive
    if (avgCascades > 0.6 && avgStrategic > 0.6) {
      return 'competitive';
    }

    // Consistent high efficiency = completionist
    if (avgEfficiency > 0.85) {
      return 'completionist';
    }

    // Default to casual
    return 'casual';
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(
    current: PlayerPerformance,
    recentMoves: MoveAnalysis[]
  ): PlayerPerformance {
    const alpha = 0.1; // Learning rate

    return {
      avgMovesPerLevel: current.avgMovesPerLevel,
      avgCompletionTime: current.avgCompletionTime,
      successRate: current.successRate,
      comboFrequency: 
        current.comboFrequency * (1 - alpha) + 
        this.calculateComboFrequency(recentMoves) * alpha,
      powerUpUsage: current.powerUpUsage,
      perfectLevels: current.perfectLevels,
      avgScorePerMove: 
        current.avgScorePerMove * (1 - alpha) +
        this.calculateAvgScorePerMove(recentMoves) * alpha
    };
  }

  /**
   * Update player preferences based on patterns
   */
  private updatePreferences(current: any, moves: MoveAnalysis[]): any {
    const patterns = moves.map(m => m.pattern);
    const patternCounts: Record<string, number> = {};

    patterns.forEach(p => {
      patternCounts[p.type] = (patternCounts[p.type] || 0) + 1;
    });

    // Update preferred patterns
    const preferredPatterns = Object.entries(patternCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        type: type as 'corner' | 'center' | 'edge' | 'random',
        frequency: count / patterns.length
      }));

    return {
      ...current,
      preferredPatterns: preferredPatterns.slice(0, 3),
      avgMovesPerTurn: mean(moves.map(() => 1)) // Simplified for now
    };
  }

  // Helper methods
  private estimateMoveScore(move: Move, gameState: GameState): number {
    // Simplified score estimation
    return 100 + Math.random() * 200;
  }

  private calculateObjectiveProgress(move: Move, gameState: GameState): number {
    // Check if move helps complete objectives
    return Math.random(); // Placeholder
  }

  private calculateFuturePotential(move: Move, gameState: GameState): number {
    // Evaluate board state after move
    return Math.random(); // Placeholder
  }

  private evaluateSpecialGemUsage(move: Move, gameState: GameState): number {
    // Check if move uses special gems effectively
    return Math.random(); // Placeholder
  }

  private calculatePatternFrequency(type: string): number {
    const recentPatterns = this.moveHistory.slice(-20).map(m => m.pattern.type);
    return recentPatterns.filter(t => t === type).length / recentPatterns.length;
  }

  private simulateMove(grid: any[][], move: Move): any[][] {
    // Create grid copy and simulate move
    const newGrid = grid.map(row => [...row]);
    // Swap logic here
    return newGrid;
  }

  private createsSpecialGemOpportunity(move: Move, gameState: GameState): boolean {
    // Check if move sets up 4+ match
    return Math.random() > 0.7; // Placeholder
  }

  private countMatchOpportunities(move: Move, gameState: GameState): number {
    // Count possible matches after this move
    return Math.floor(Math.random() * 5); // Placeholder
  }

  private clearsBottleneck(move: Move, gameState: GameState): boolean {
    // Check if move helps clear difficult areas
    return Math.random() > 0.8; // Placeholder
  }

  private calculateComboFrequency(moves: MoveAnalysis[]): number {
    // Calculate how often player creates combos
    return mean(moves.map(m => m.cascadePotential));
  }

  private calculateAvgScorePerMove(moves: MoveAnalysis[]): number {
    // Estimate average score per move
    return mean(moves.map(m => m.efficiency * 150));
  }
}