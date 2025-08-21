export interface Product {
  id: string;
  type: ProductType;
  price: number;
  currency: string;
  name: string;
  description: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export enum ProductType {
  CONSUMABLE = 'consumable',
  NON_CONSUMABLE = 'non_consumable',
  SUBSCRIPTION = 'subscription',
}

export interface Purchase {
  id: string;
  productId: string;
  userId: string;
  timestamp: Date;
  price: number;
  currency: string;
  platform: 'web' | 'ios' | 'android';
  receipt?: string;
  verified: boolean;
}

export interface AdConfig {
  provider: AdProvider;
  unitId: string;
  type: AdType;
  frequency?: number;
  cooldown?: number;
}

export enum AdProvider {
  ADMOB = 'admob',
  UNITY_ADS = 'unity_ads',
  APPLOVIN = 'applovin',
  IRONSOURCE = 'ironsource',
}

export enum AdType {
  BANNER = 'banner',
  INTERSTITIAL = 'interstitial',
  REWARDED_VIDEO = 'rewarded_video',
  NATIVE = 'native',
}

export interface AdResult {
  success: boolean;
  provider: AdProvider;
  type: AdType;
  revenue?: number;
  error?: string;
}

export interface RewardConfig {
  type: RewardType;
  amount: number;
  currency?: 'gems' | 'coins';
}

export enum RewardType {
  CURRENCY = 'currency',
  POWER_UP = 'power_up',
  EXTRA_MOVES = 'extra_moves',
  LIFE = 'life',
  BOOSTER = 'booster',
}

export interface BattlePass {
  id: string;
  season: number;
  startDate: Date;
  endDate: Date;
  tiers: BattlePassTier[];
  price: number;
  purchased: boolean;
  currentTier: number;
  currentXP: number;
}

export interface BattlePassTier {
  tier: number;
  requiredXP: number;
  freeReward?: Reward;
  premiumReward?: Reward;
}

export interface Reward {
  type: RewardType;
  itemId?: string;
  amount: number;
  description: string;
}

export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  products: Product[];
  discount: number;
  expiresAt: Date;
  limit?: number;
  purchased: number;
}