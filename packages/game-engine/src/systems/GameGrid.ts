import * as Phaser from 'phaser';
import { Gem } from '../components/Gem';
import { EventEmitter } from 'eventemitter3';
import type { 
  Gem as GemData, 
  GemType, 
  Position, 
  Match,
  MoveResult 
} from '@dreamcrafter/shared-types';
import { 
  GRID_ROWS, 
  GRID_COLS, 
  GEM_SIZE, 
  GRID_OFFSET_X, 
  GRID_OFFSET_Y 
} from '../config/GameConfig';

export class GameGrid extends EventEmitter {
  private scene: Phaser.Scene;
  private grid: (Gem | null)[][];
  private selectedGem: Gem | null = null;
  private isProcessing: boolean = false;
  private gemTypes: GemType[] = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange'
  ];

  constructor(scene: Phaser.Scene) {
    super();
    this.scene = scene;
    this.grid = this.createEmptyGrid();
  }

  private createEmptyGrid(): (Gem | null)[][] {
    return Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));
  }

  public initialize(): void {
    this.generateInitialGrid();
  }

  private generateInitialGrid(): void {
    // Fill grid with random gems ensuring no initial matches
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        let gemType: GemType;
        do {
          gemType = this.getRandomGemType();
        } while (this.wouldCreateMatch(col, row, gemType));

        this.createGem(col, row, gemType);
      }
    }
  }

  private wouldCreateMatch(col: number, row: number, gemType: GemType): boolean {
    // Check horizontal match
    if (col >= 2) {
      const gem1 = this.grid[row][col - 1];
      const gem2 = this.grid[row][col - 2];
      if (gem1?.data.type === gemType && gem2?.data.type === gemType) {
        return true;
      }
    }

    // Check vertical match
    if (row >= 2) {
      const gem1 = this.grid[row - 1][col];
      const gem2 = this.grid[row - 2][col];
      if (gem1?.data.type === gemType && gem2?.data.type === gemType) {
        return true;
      }
    }

    return false;
  }

  private createGem(col: number, row: number, gemType: GemType): Gem {
    const x = GRID_OFFSET_X + col * GEM_SIZE + GEM_SIZE / 2;
    const y = GRID_OFFSET_Y + row * GEM_SIZE + GEM_SIZE / 2;

    const gemData: GemData = {
      id: `gem_${row}_${col}_${Date.now()}`,
      type: gemType,
      position: { x: col, y: row },
      isSpecial: false,
    };

    const gem = new Gem(this.scene, x, y, col, row, gemData);
    gem.on('gemClicked', this.handleGemClick, this);
    
    this.grid[row][col] = gem;
    return gem;
  }

  private getRandomGemType(): GemType {
    return this.gemTypes[Math.floor(Math.random() * this.gemTypes.length)];
  }

  private handleGemClick(gem: Gem): void {
    if (this.isProcessing) return;

    if (!this.selectedGem) {
      this.selectedGem = gem;
      gem.select();
    } else {
      if (this.selectedGem === gem) {
        gem.deselect();
        this.selectedGem = null;
      } else if (this.areAdjacent(this.selectedGem, gem)) {
        this.swapGems(this.selectedGem, gem);
      } else {
        this.selectedGem.deselect();
        this.selectedGem = gem;
        gem.select();
      }
    }
  }

  private areAdjacent(gem1: Gem, gem2: Gem): boolean {
    const pos1 = gem1.getGridPosition();
    const pos2 = gem2.getGridPosition();
    
    const dx = Math.abs(pos1.x - pos2.x);
    const dy = Math.abs(pos1.y - pos2.y);
    
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }

  private async swapGems(gem1: Gem, gem2: Gem): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const pos1 = gem1.getGridPosition();
    const pos2 = gem2.getGridPosition();

    // Deselect gems
    gem1.deselect();
    gem2.deselect();
    this.selectedGem = null;

    // Update grid positions
    this.grid[pos1.y][pos1.x] = gem2;
    this.grid[pos2.y][pos2.x] = gem1;

    // Animate swap
    await Promise.all([
      gem1.moveTo(
        GRID_OFFSET_X + pos2.x * GEM_SIZE + GEM_SIZE / 2,
        GRID_OFFSET_Y + pos2.y * GEM_SIZE + GEM_SIZE / 2,
        pos2.x,
        pos2.y
      ),
      gem2.moveTo(
        GRID_OFFSET_X + pos1.x * GEM_SIZE + GEM_SIZE / 2,
        GRID_OFFSET_Y + pos1.y * GEM_SIZE + GEM_SIZE / 2,
        pos1.x,
        pos1.y
      )
    ]);

    // Check for matches
    const matches = this.findAllMatches();

    if (matches.length === 0) {
      // No matches, swap back
      await this.swapGemsBack(gem1, gem2, pos1, pos2);
      this.isProcessing = false;
    } else {
      // Process matches
      const moveResult = await this.processMatches(matches);
      this.emit('moveCompleted', moveResult);
      this.isProcessing = false;
    }
  }

  private async swapGemsBack(gem1: Gem, gem2: Gem, pos1: Position, pos2: Position): Promise<void> {
    // Update grid positions back
    this.grid[pos1.y][pos1.x] = gem1;
    this.grid[pos2.y][pos2.x] = gem2;

    // Animate swap back
    await Promise.all([
      gem1.moveTo(
        GRID_OFFSET_X + pos1.x * GEM_SIZE + GEM_SIZE / 2,
        GRID_OFFSET_Y + pos1.y * GEM_SIZE + GEM_SIZE / 2,
        pos1.x,
        pos1.y
      ),
      gem2.moveTo(
        GRID_OFFSET_X + pos2.x * GEM_SIZE + GEM_SIZE / 2,
        GRID_OFFSET_Y + pos2.y * GEM_SIZE + GEM_SIZE / 2,
        pos2.x,
        pos2.y
      )
    ]);
  }

  private findAllMatches(): Match[] {
    const matches: Match[] = [];
    const processedGems = new Set<string>();

    // Find horizontal matches
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS - 2; col++) {
        const match = this.findHorizontalMatch(col, row, processedGems);
        if (match) {
          matches.push(match);
        }
      }
    }

    // Find vertical matches
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS - 2; row++) {
        const match = this.findVerticalMatch(col, row, processedGems);
        if (match) {
          matches.push(match);
        }
      }
    }

    return matches;
  }

  private findHorizontalMatch(startCol: number, row: number, processedGems: Set<string>): Match | null {
    const firstGem = this.grid[row][startCol];
    if (!firstGem || processedGems.has(firstGem.data.id)) return null;

    const gemType = firstGem.data.type;
    const matchedGems: Gem[] = [firstGem];

    // Check consecutive gems
    for (let col = startCol + 1; col < GRID_COLS; col++) {
      const gem = this.grid[row][col];
      if (gem && gem.data.type === gemType && !processedGems.has(gem.data.id)) {
        matchedGems.push(gem);
      } else {
        break;
      }
    }

    if (matchedGems.length >= 3) {
      matchedGems.forEach(gem => processedGems.add(gem.data.id));
      return {
        gems: matchedGems.map(g => g.data),
        type: 'horizontal',
        score: this.calculateMatchScore(matchedGems.length),
      };
    }

    return null;
  }

  private findVerticalMatch(col: number, startRow: number, processedGems: Set<string>): Match | null {
    const firstGem = this.grid[startRow][col];
    if (!firstGem || processedGems.has(firstGem.data.id)) return null;

    const gemType = firstGem.data.type;
    const matchedGems: Gem[] = [firstGem];

    // Check consecutive gems
    for (let row = startRow + 1; row < GRID_ROWS; row++) {
      const gem = this.grid[row][col];
      if (gem && gem.data.type === gemType && !processedGems.has(gem.data.id)) {
        matchedGems.push(gem);
      } else {
        break;
      }
    }

    if (matchedGems.length >= 3) {
      matchedGems.forEach(gem => processedGems.add(gem.data.id));
      return {
        gems: matchedGems.map(g => g.data),
        type: 'vertical',
        score: this.calculateMatchScore(matchedGems.length),
      };
    }

    return null;
  }

  private calculateMatchScore(matchLength: number): number {
    const baseScore = 50;
    const bonusMultiplier = matchLength - 2;
    return baseScore * matchLength + (bonusMultiplier * 50);
  }

  private async processMatches(matches: Match[]): Promise<MoveResult> {
    let totalScore = 0;
    let cascadeCount = 0;

    while (matches.length > 0) {
      // Calculate score
      matches.forEach(match => {
        totalScore += match.score;
      });

      // Remove matched gems
      await this.removeMatchedGems(matches);

      // Drop gems
      await this.dropGems();

      // Fill empty spaces
      await this.fillEmptySpaces();

      // Check for new matches (cascades)
      matches = this.findAllMatches();
      if (matches.length > 0) {
        cascadeCount++;
      }
    }

    return {
      valid: true,
      score: totalScore,
      cascades: cascadeCount,
    };
  }

  private async removeMatchedGems(matches: Match[]): Promise<void> {
    const animations: Promise<void>[] = [];
    const gemsToRemove = new Set<string>();

    matches.forEach(match => {
      match.gems.forEach(gemData => {
        gemsToRemove.add(gemData.id);
      });
    });

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const gem = this.grid[row][col];
        if (gem && gemsToRemove.has(gem.data.id)) {
          animations.push(gem.playMatchAnimation());
          this.emit('gemMatched', gem);
        }
      }
    }

    await Promise.all(animations);

    // Remove gems from grid
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const gem = this.grid[row][col];
        if (gem && gemsToRemove.has(gem.data.id)) {
          gem.destroy();
          this.grid[row][col] = null;
        }
      }
    }
  }

  private async dropGems(): Promise<void> {
    const animations: Promise<void>[] = [];

    for (let col = 0; col < GRID_COLS; col++) {
      let emptyRow = -1;
      
      for (let row = GRID_ROWS - 1; row >= 0; row--) {
        if (this.grid[row][col] === null && emptyRow === -1) {
          emptyRow = row;
        } else if (this.grid[row][col] !== null && emptyRow !== -1) {
          const gem = this.grid[row][col]!;
          this.grid[emptyRow][col] = gem;
          this.grid[row][col] = null;
          
          const newY = GRID_OFFSET_Y + emptyRow * GEM_SIZE + GEM_SIZE / 2;
          animations.push(gem.fall(newY, emptyRow));
          
          emptyRow--;
        }
      }
    }

    await Promise.all(animations);
  }

  private async fillEmptySpaces(): Promise<void> {
    const animations: Promise<void>[] = [];

    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        if (this.grid[row][col] === null) {
          const gemType = this.getRandomGemType();
          const gem = this.createGem(col, row, gemType);
          
          // Start above screen
          gem.y = -GEM_SIZE;
          
          const targetY = GRID_OFFSET_Y + row * GEM_SIZE + GEM_SIZE / 2;
          animations.push(gem.fall(targetY, row, row * 0.05));
        }
      }
    }

    await Promise.all(animations);
  }

  public destroy(): void {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (this.grid[row][col]) {
          this.grid[row][col]!.destroy();
        }
      }
    }
    this.removeAllListeners();
  }
}