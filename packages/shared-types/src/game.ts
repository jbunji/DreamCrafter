export interface Position {
  x: number;
  y: number;
}

export enum GemType {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  PURPLE = 'purple',
  ORANGE = 'orange',
}

export enum SpecialType {
  BOMB = 'bomb',
  LIGHTNING_HORIZONTAL = 'lightning_h',
  LIGHTNING_VERTICAL = 'lightning_v',
  RAINBOW = 'rainbow',
}

export interface Gem {
  id: string;
  type: GemType;
  position: Position;
  isSpecial: boolean;
  specialType?: SpecialType;
  isMatched?: boolean;
  isFalling?: boolean;
}

export interface Match {
  gems: Gem[];
  type: 'horizontal' | 'vertical' | 'cross' | 'special';
  score: number;
  specialCreated?: SpecialType;
}

export interface GameState {
  level: number;
  score: number;
  moves: number;
  movesLeft: number;
  grid: (Gem | null)[][];
  objectives: Objective[];
  powerUps: PowerUp[];
  difficulty: number;
  puzzleId: string;
  isPaused: boolean;
  isGameOver: boolean;
}

export interface Objective {
  id: string;
  type: ObjectiveType;
  target: number;
  current: number;
  description: string;
}

export enum ObjectiveType {
  SCORE = 'score',
  COLLECT_GEM = 'collect_gem',
  CLEAR_SPECIAL = 'clear_special',
  COMBO = 'combo',
}

export interface PowerUp {
  id: string;
  type: PowerUpType;
  count: number;
  isActive: boolean;
}

export enum PowerUpType {
  EXTRA_MOVES = 'extra_moves',
  SHUFFLE = 'shuffle',
  HAMMER = 'hammer',
  COLOR_BOMB = 'color_bomb',
}

export interface MoveResult {
  valid: boolean;
  score?: number;
  matches?: Match[];
  cascades?: number;
  specialsCreated?: SpecialType[];
  objectivesProgress?: ObjectiveProgress[];
}

export interface ObjectiveProgress {
  objectiveId: string;
  progress: number;
  completed: boolean;
}

export interface LevelConfig {
  id: string;
  levelNumber: number;
  gridSize: { width: number; height: number };
  moves: number;
  objectives: Objective[];
  availableGems: GemType[];
  specialTiles?: SpecialTile[];
  difficulty: number;
}

export interface SpecialTile {
  position: Position;
  type: 'blocker' | 'ice' | 'chain';
  health: number;
}

export interface Animation {
  id: string;
  type: AnimationType;
  targets: Position[];
  duration: number;
  delay?: number;
}

export enum AnimationType {
  SWAP = 'swap',
  MATCH = 'match',
  FALL = 'fall',
  EXPLODE = 'explode',
  SPECIAL_ACTIVATE = 'special_activate',
}