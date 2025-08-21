export interface AnalyticsEvent {
  name: string;
  params: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId: string;
  platform: 'web' | 'ios' | 'android';
}

export interface SessionData {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  platform: 'web' | 'ios' | 'android';
  deviceInfo: DeviceInfo;
  events: AnalyticsEvent[];
}

export interface DeviceInfo {
  model: string;
  os: string;
  osVersion: string;
  screenResolution: string;
  language: string;
  timezone: string;
}

export interface GameplayMetrics {
  level: number;
  score: number;
  time: number;
  moves: number;
  difficulty: number;
  cascades: number;
  powerUpsUsed: string[];
  objectivesCompleted: number;
  result: 'win' | 'lose' | 'quit';
}

export interface EngagementMetrics {
  sessionLength: number;
  levelsPlayed: number;
  retentionDay: number;
  lastPlayedDaysAgo: number;
  totalSessions: number;
  avgSessionLength: number;
}

export interface MonetizationMetrics {
  revenue: number;
  adsWatched: number;
  adRevenue: number;
  iapRevenue: number;
  purchaseCount: number;
  avgPurchaseValue: number;
  ltv: number;
}

export interface PerformanceMetrics {
  fps: number;
  loadTime: number;
  memoryUsage: number;
  batteryDrain: number;
  crashCount: number;
  errorCount: number;
}

export interface ABTestData {
  testId: string;
  variant: string;
  userId: string;
  metrics: Record<string, any>;
  enrolled: Date;
}

export interface FunnelEvent {
  step: string;
  timestamp: Date;
  userId: string;
  properties?: Record<string, any>;
}

export interface RetentionCohort {
  cohortDate: Date;
  day0: number;
  day1: number;
  day3: number;
  day7: number;
  day14: number;
  day30: number;
}