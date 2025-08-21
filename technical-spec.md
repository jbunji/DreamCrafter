# DreamCrafter Technical Specification

## Game Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Phaser.js     │────▶│   Brain.js AI    │────▶│ Puzzle Generator│
│  Game Engine    │     │  (Neural Network)│     │   Algorithm     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         ▼                       ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Game State    │     │ Player Profile   │     │  Puzzle Cache   │
│   Manager       │     │    Database      │     │   (IndexedDB)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Core Systems

### 1. Dynamic Puzzle Generator

```typescript
interface PuzzleConfig {
  gridSize: { width: number; height: number; };
  gemTypes: number;
  difficulty: number; // 0-1
  playerProfile: PlayerProfile;
  specialTiles: SpecialTile[];
}

class DynamicPuzzleGenerator {
  private neuralNetwork: brain.NeuralNetwork;
  private playerAnalyzer: PlayerAnalyzer;
  
  generatePuzzle(player: Player): Puzzle {
    const profile = this.playerAnalyzer.getProfile(player);
    const difficulty = this.calculateOptimalDifficulty(profile);
    
    const puzzle = this.createBasePuzzle(difficulty);
    this.ensureSolvability(puzzle);
    this.addPlayerPreferences(puzzle, profile);
    
    return {
      id: this.generatePuzzleId(),
      grid: puzzle,
      difficulty,
      signature: `DreamCrafted for ${player.name}!`,
      shareCode: this.generateShareCode(puzzle)
    };
  }
  
  private calculateOptimalDifficulty(profile: PlayerProfile): number {
    const input = [
      profile.avgMovesPerLevel,
      profile.avgCompletionTime,
      profile.successRate,
      profile.comboFrequency,
      profile.powerUpUsage
    ];
    
    const output = this.neuralNetwork.run(input);
    return Math.max(0.1, Math.min(0.95, output[0]));
  }
}
```

### 2. Player Skill Tracking System

```typescript
interface PlayerProfile {
  skillLevel: number;
  playStyle: PlayStyle;
  preferences: {
    favoriteGemColors: string[];
    preferredPatterns: Pattern[];
    avgMovesPerTurn: number;
  };
  performance: {
    avgMovesPerLevel: number;
    avgCompletionTime: number;
    successRate: number;
    comboFrequency: number;
    powerUpUsage: number;
  };
}

class PlayerAnalyzer {
  private readonly LEARNING_WINDOW = 20; // levels
  
  analyzeMove(move: Move, gameState: GameState): MoveAnalysis {
    return {
      efficiency: this.calculateMoveEfficiency(move, gameState),
      pattern: this.detectPattern(move),
      timing: performance.now() - gameState.lastMoveTime,
      cascadePotential: this.predictCascades(move, gameState)
    };
  }
  
  updateProfile(player: Player, moveAnalysis: MoveAnalysis[]): void {
    const profile = player.profile;
    
    // Update skill level using exponential moving average
    profile.skillLevel = profile.skillLevel * 0.9 + 
                        this.calculateSkillDelta(moveAnalysis) * 0.1;
    
    // Detect play style changes
    profile.playStyle = this.classifyPlayStyle(moveAnalysis);
    
    // Train neural network with new data
    this.trainNetwork(profile, moveAnalysis);
  }
}
```

### 3. Match-3 Game Engine

```typescript
class Match3Engine {
  private grid: Gem[][];
  private animationQueue: Animation[];
  private scoreManager: ScoreManager;
  
  async makeMove(from: Position, to: Position): Promise<MoveResult> {
    if (!this.isValidMove(from, to)) {
      return { valid: false };
    }
    
    // Swap gems
    await this.swapGems(from, to);
    
    // Check for matches
    const matches = this.findMatches();
    
    if (matches.length === 0) {
      await this.swapGems(from, to); // Revert
      return { valid: false };
    }
    
    // Process matches and cascades
    let totalScore = 0;
    let cascadeCount = 0;
    
    while (matches.length > 0) {
      totalScore += this.processMatches(matches);
      await this.dropGems();
      await this.fillEmptySpaces();
      matches = this.findMatches();
      cascadeCount++;
    }
    
    return {
      valid: true,
      score: totalScore,
      cascades: cascadeCount,
      specialsCreated: this.checkForSpecials()
    };
  }
  
  private findMatches(): Match[] {
    const matches: Match[] = [];
    
    // Horizontal matches
    for (let y = 0; y < this.grid.length; y++) {
      let matchLength = 1;
      let currentType = this.grid[y][0]?.type;
      
      for (let x = 1; x < this.grid[0].length; x++) {
        if (this.grid[y][x]?.type === currentType) {
          matchLength++;
        } else {
          if (matchLength >= 3) {
            matches.push(this.createMatch(y, x - matchLength, matchLength, 'horizontal'));
          }
          matchLength = 1;
          currentType = this.grid[y][x]?.type;
        }
      }
    }
    
    // Vertical matches (similar logic)
    // ... 
    
    return this.mergeOverlappingMatches(matches);
  }
}
```

### 4. AI Training Pipeline

```typescript
class AITrainingPipeline {
  private trainingData: TrainingData[] = [];
  private network: brain.NeuralNetwork;
  
  collectTrainingData(session: GameSession): void {
    const data: TrainingData = {
      input: [
        session.avgTimePerMove,
        session.successRate,
        session.powerUpEfficiency,
        session.cascadeFrequency,
        session.scorePerMove
      ],
      output: [
        session.playerSatisfaction, // 0-1, from retention data
        session.optimalDifficulty   // 0-1, calculated post-hoc
      ]
    };
    
    this.trainingData.push(data);
    
    if (this.trainingData.length >= 100) {
      this.trainNetwork();
    }
  }
  
  private async trainNetwork(): Promise<void> {
    const config = {
      hiddenLayers: [8, 6],
      activation: 'sigmoid',
      learningRate: 0.1
    };
    
    this.network = new brain.NeuralNetwork(config);
    
    await this.network.train(this.trainingData, {
      iterations: 20000,
      errorThresh: 0.005
    });
    
    // Save trained model
    await this.saveModel(this.network.toJSON());
  }
}
```

## Data Models

### Game State
```typescript
interface GameState {
  level: number;
  score: number;
  moves: number;
  grid: Gem[][];
  objectives: Objective[];
  powerUps: PowerUp[];
  difficulty: number;
  puzzleId: string;
}

interface Gem {
  type: GemType;
  position: Position;
  isSpecial: boolean;
  specialType?: SpecialType;
}

enum GemType {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange'
}
```

### Player Data
```typescript
interface PlayerData {
  id: string;
  username: string;
  level: number;
  experience: number;
  currency: {
    gems: number;
    coins: number;
  };
  purchases: Purchase[];
  settings: PlayerSettings;
  statistics: PlayerStatistics;
}

interface PlayerStatistics {
  gamesPlayed: number;
  totalScore: number;
  highestLevel: number;
  totalTime: number;
  puzzlesShared: number;
  puzzlesPlayed: number;
  winStreak: number;
}
```

## Performance Optimization

### Rendering Pipeline
```typescript
class RenderingOptimizer {
  private renderQueue: RenderTask[];
  private objectPool: ObjectPool;
  
  optimizeRendering(): void {
    // Batch similar draw calls
    this.batchDrawCalls();
    
    // Use object pooling for gems
    this.initializeObjectPool(1000);
    
    // Implement dirty rectangle optimization
    this.enableDirtyRectangles();
    
    // GPU particle systems
    this.initializeGPUParticles();
  }
  
  private batchDrawCalls(): void {
    // Group gems by texture atlas
    // Minimize state changes
    // Use instanced rendering where possible
  }
}
```

### Memory Management
```typescript
class MemoryManager {
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private assetCache: Map<string, Asset>;
  
  preloadAssets(): Promise<void> {
    return Promise.all([
      this.loadTextures(),
      this.loadSounds(),
      this.loadAnimations()
    ]);
  }
  
  manageCacheSize(): void {
    if (this.getCacheSize() > this.MAX_CACHE_SIZE) {
      this.evictLRUAssets();
    }
  }
}
```

## Monetization Integration

### Ad Manager
```typescript
class AdManager {
  private adNetworks: AdNetwork[];
  private adFrequency: AdFrequencyConfig;
  
  async showRewardedAd(): Promise<AdResult> {
    const network = this.selectOptimalNetwork();
    
    try {
      const result = await network.showRewardedVideo();
      this.trackAdMetrics(result);
      return result;
    } catch (error) {
      return this.fallbackAdStrategy();
    }
  }
  
  private selectOptimalNetwork(): AdNetwork {
    // Choose based on fill rate, eCPM, and user location
    return this.adNetworks.sort((a, b) => 
      b.getExpectedRevenue() - a.getExpectedRevenue()
    )[0];
  }
}
```

### IAP Handler
```typescript
class IAPHandler {
  async purchasePowerUp(productId: string): Promise<PurchaseResult> {
    try {
      const product = await this.store.getProduct(productId);
      const receipt = await this.store.purchase(product);
      
      // Verify receipt server-side
      const verified = await this.verifyReceipt(receipt);
      
      if (verified) {
        await this.grantProduct(productId);
        this.trackPurchase(product);
      }
      
      return { success: verified };
    } catch (error) {
      this.handlePurchaseError(error);
      return { success: false, error };
    }
  }
}
```

## Analytics Implementation

```typescript
class GameAnalytics {
  private events: AnalyticsEvent[] = [];
  private session: SessionData;
  
  trackEvent(eventName: string, params: any): void {
    const event: AnalyticsEvent = {
      name: eventName,
      params,
      timestamp: Date.now(),
      sessionId: this.session.id,
      userId: this.session.userId
    };
    
    this.events.push(event);
    
    if (this.events.length >= 10) {
      this.flushEvents();
    }
  }
  
  trackGameplayMetrics(): void {
    // Automatic tracking
    this.trackEvent('level_complete', {
      level: this.currentLevel,
      score: this.score,
      time: this.completionTime,
      moves: this.moveCount,
      difficulty: this.puzzleDifficulty
    });
  }
}
```

## Testing Framework

```typescript
describe('DynamicPuzzleGenerator', () => {
  it('should generate solvable puzzles', async () => {
    const generator = new DynamicPuzzleGenerator();
    const puzzle = generator.generatePuzzle(mockPlayer);
    
    expect(puzzle).toBeDefined();
    expect(isSolvable(puzzle)).toBe(true);
  });
  
  it('should adapt difficulty to player skill', async () => {
    const lowSkillPlayer = createPlayer({ skillLevel: 0.2 });
    const highSkillPlayer = createPlayer({ skillLevel: 0.8 });
    
    const easyPuzzle = generator.generatePuzzle(lowSkillPlayer);
    const hardPuzzle = generator.generatePuzzle(highSkillPlayer);
    
    expect(easyPuzzle.difficulty).toBeLessThan(hardPuzzle.difficulty);
  });
});
```

## Deployment Configuration

### Web Build
```javascript
// webpack.config.js
module.exports = {
  entry: './src/game.ts',
  output: {
    filename: 'dreamcrafter.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all'
    }
  }
};
```

### Mobile Build
```javascript
// capacitor.config.json
{
  "appId": "com.dreamcrafter.game",
  "appName": "DreamCrafter",
  "webDir": "dist",
  "plugins": {
    "AdMob": {
      "appId": "ca-app-pub-xxx"
    }
  }
}
```