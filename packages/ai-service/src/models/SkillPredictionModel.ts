import * as brain from 'brain.js';
import type { PlayerProfile, TrainingData } from '@dreamcrafter/shared-types';

export interface SkillPredictionConfig {
  hiddenLayers: number[];
  learningRate: number;
  iterations: number;
  errorThresh: number;
}

export class SkillPredictionModel {
  private network: brain.NeuralNetwork;
  private config: SkillPredictionConfig;
  private isTraining: boolean = false;
  private trainingHistory: TrainingData[] = [];

  constructor(config?: Partial<SkillPredictionConfig>) {
    this.config = {
      hiddenLayers: [12, 8, 6],
      learningRate: 0.3,
      iterations: 20000,
      errorThresh: 0.005,
      ...config
    };

    this.network = new brain.NeuralNetwork({
      hiddenLayers: this.config.hiddenLayers,
      activation: 'sigmoid',
      learningRate: this.config.learningRate
    });
  }

  /**
   * Train the model with player performance data
   */
  async train(trainingData: TrainingData[]): Promise<brain.ITrainingStatus> {
    if (this.isTraining) {
      throw new Error('Model is already training');
    }

    this.isTraining = true;
    this.trainingHistory.push(...trainingData);

    try {
      // Normalize data for neural network (0-1 range)
      const normalizedData = trainingData.map(data => ({
        input: this.normalizeInput(data.input),
        output: this.normalizeOutput(data.output)
      }));

      const stats = await this.network.trainAsync(normalizedData, {
        iterations: this.config.iterations,
        errorThresh: this.config.errorThresh,
        log: false,
        logPeriod: 100,
        callback: (stats) => {
          if ((stats as any).iterations % 1000 === 0) {
            console.log(`Training progress: ${(stats as any).iterations} iterations, error: ${stats.error}`);
          }
        }
      });

      return stats;
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Predict optimal difficulty for a player
   */
  predictDifficulty(profile: PlayerProfile): number {
    const input = this.profileToInput(profile);
    const normalizedInput = this.normalizeInput(input);
    const output = this.network.run(normalizedInput) as number[];
    
    // Denormalize output
    return this.denormalizeOutput(output)[0];
  }

  /**
   * Predict player satisfaction score
   */
  predictSatisfaction(profile: PlayerProfile, difficulty: number): number {
    const input = [...this.profileToInput(profile), difficulty];
    const normalizedInput = this.normalizeInput(input);
    const output = this.network.run(normalizedInput) as number[];
    
    return this.denormalizeOutput(output)[1] || 0.75; // Default satisfaction
  }

  /**
   * Convert player profile to neural network input
   */
  private profileToInput(profile: PlayerProfile): number[] {
    return [
      profile.performance.avgMovesPerLevel / 50, // Normalize to ~0-1
      profile.performance.avgCompletionTime / 300, // 5 minutes max
      profile.performance.successRate,
      profile.performance.comboFrequency,
      profile.performance.powerUpUsage / 10,
      profile.skillLevel,
      profile.statistics.gamesPlayed / 1000,
      profile.statistics.winStreak / 20,
      this.encodePlayStyle(profile.playStyle)
    ];
  }

  /**
   * Encode play style as numeric value
   */
  private encodePlayStyle(playStyle: string): number {
    const styles: Record<string, number> = {
      'strategic': 0.2,
      'fast_paced': 0.4,
      'completionist': 0.6,
      'casual': 0.8,
      'competitive': 1.0
    };
    return styles[playStyle] || 0.5;
  }

  /**
   * Normalize input values to 0-1 range
   */
  private normalizeInput(input: number[]): number[] {
    return input.map(value => Math.max(0, Math.min(1, value)));
  }

  /**
   * Normalize output values to 0-1 range
   */
  private normalizeOutput(output: number[]): number[] {
    return output.map(value => Math.max(0, Math.min(1, value)));
  }

  /**
   * Denormalize output values from 0-1 range
   */
  private denormalizeOutput(output: number[]): number[] {
    return output;
  }

  /**
   * Save the trained model
   */
  toJSON(): string {
    return JSON.stringify({
      network: this.network.toJSON(),
      config: this.config,
      trainingHistory: this.trainingHistory.length
    });
  }

  /**
   * Load a trained model
   */
  static fromJSON(json: string): SkillPredictionModel {
    const data = JSON.parse(json);
    const model = new SkillPredictionModel(data.config);
    model.network.fromJSON(data.network);
    return model;
  }

  /**
   * Get model accuracy on test data
   */
  evaluate(testData: TrainingData[]): { accuracy: number; mse: number } {
    let totalError = 0;
    let correctPredictions = 0;

    testData.forEach(data => {
      const input = this.normalizeInput(data.input);
      const expected = this.normalizeOutput(data.output);
      const predicted = this.network.run(input) as number[];

      // Calculate mean squared error
      const error = expected.reduce((sum, exp, i) => {
        const diff = exp - predicted[i];
        return sum + (diff * diff);
      }, 0) / expected.length;

      totalError += error;

      // Consider prediction correct if within 10% threshold
      if (Math.abs(expected[0] - predicted[0]) < 0.1) {
        correctPredictions++;
      }
    });

    return {
      accuracy: correctPredictions / testData.length,
      mse: totalError / testData.length
    };
  }
}