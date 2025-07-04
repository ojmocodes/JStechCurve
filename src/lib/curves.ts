// Mathematical implementation of technology adoption curves

export interface CurvePoint {
  time: number;
  value: number;
}

// Generate Hype Cycle curve points
export function generateHypeCycle(timeRange: number = 20, points: number = 100): CurvePoint[] {
  const curve: CurvePoint[] = [];
  
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * timeRange;
    
    // Hype cycle mathematical model
    // Peak of inflated expectations around t=2-3
    // Trough of disillusionment around t=8-10
    // Slope of enlightenment and plateau starting around t=12
    
    let value: number;
    
    if (t <= 3) {
      // Technology trigger to peak of inflated expectations
      value = 0.1 + 0.9 * (1 - Math.exp(-t * 1.5)) * Math.exp(-((t - 2.5) ** 2) / 2);
    } else if (t <= 10) {
      // Trough of disillusionment
      const peakValue = 0.95;
      const troughValue = 0.15;
      const decline = Math.exp(-(t - 3) * 0.8);
      value = troughValue + (peakValue - troughValue) * decline;
    } else {
      // Slope of enlightenment to plateau of productivity
      const troughValue = 0.15;
      const plateauValue = 0.7;
      const progress = Math.min(1, (t - 10) / 8);
      // S-curve growth from trough to plateau
      value = troughValue + (plateauValue - troughValue) * (1 / (1 + Math.exp(-5 * (progress - 0.5))));
    }
    
    curve.push({ time: t, value: Math.max(0, Math.min(1, value)) });
  }
  
  return curve;
}

// Generate S-Curve adoption curve points
export function generateSCurve(timeRange: number = 20, points: number = 100): CurvePoint[] {
  const curve: CurvePoint[] = [];
  
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * timeRange;
    
    // S-curve adoption model (logistic function)
    // Slow start, rapid growth in middle, plateau at end
    const growthRate = 0.5; // Controls steepness
    const midpoint = timeRange * 0.4; // When 50% adoption occurs
    
    const value = 1 / (1 + Math.exp(-growthRate * (t - midpoint)));
    
    curve.push({ time: t, value });
  }
  
  return curve;
}

// Blend two curves based on a ratio (0 = first curve, 1 = second curve)
export function blendCurves(
  curve1: CurvePoint[],
  curve2: CurvePoint[],
  blendRatio: number
): CurvePoint[] {
  const blended: CurvePoint[] = [];
  const minLength = Math.min(curve1.length, curve2.length);
  
  for (let i = 0; i < minLength; i++) {
    const value = curve1[i].value * (1 - blendRatio) + curve2[i].value * blendRatio;
    blended.push({
      time: curve1[i].time,
      value
    });
  }
  
  return blended;
}

// Apply time offset to a curve
export function offsetCurve(curve: CurvePoint[], offset: number): CurvePoint[] {
  return curve.map(point => ({
    time: point.time + offset,
    value: point.value
  }));
}

// Generate combined curve with all transformations
export function generateCombinedCurve(
  timeOffset: number,
  blendRatio: number,
  timeRange: number = 20,
  points: number = 100
): {
  hypeCurve: CurvePoint[];
  sCurve: CurvePoint[];
  combinedCurve: CurvePoint[];
} {
  // Generate base curves
  const hypeCurve = generateHypeCycle(timeRange, points);
  let sCurve = generateSCurve(timeRange, points);
  
  // Apply time offset to S-curve
  sCurve = offsetCurve(sCurve, timeOffset);
  
  // Blend curves: 0 = all hype cycle (speculative), 1 = all S-curve (real adoption)
  const combinedCurve = blendCurves(hypeCurve, sCurve, blendRatio);
  
  return {
    hypeCurve,
    sCurve,
    combinedCurve
  };
}