/**
 * Calculate the mean of an array of numbers
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate the standard deviation of an array of numbers
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  const variance = mean(squaredDiffs);
  
  return Math.sqrt(variance);
}

/**
 * Calculate the median of an array of numbers
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

/**
 * Normalize a value to 0-1 range
 */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

/**
 * Calculate percentile rank
 */
export function percentileRank(value: number, values: number[]): number {
  if (values.length === 0) return 0.5;
  
  const sorted = [...values].sort((a, b) => a - b);
  let rank = 0;
  
  for (const val of sorted) {
    if (val < value) rank++;
    else break;
  }
  
  return rank / values.length;
}

/**
 * Exponential moving average
 */
export function exponentialMovingAverage(
  current: number,
  new_value: number,
  alpha: number = 0.1
): number {
  return current * (1 - alpha) + new_value * alpha;
}

/**
 * Calculate correlation coefficient between two arrays
 */
export function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  
  const denominator = Math.sqrt(denomX * denomY);
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}

/**
 * Simple linear regression
 */
export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  if (x.length !== y.length || x.length === 0) {
    return { slope: 0, intercept: 0 };
  }
  
  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    
    numerator += dx * dy;
    denominator += dx * dx;
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;
  
  return { slope, intercept };
}