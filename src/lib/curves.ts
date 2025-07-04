// Mathematical implementation of technology adoption curves

export interface CurvePoint {
  time: number;
  value: number;
}

// Generate Hype Cycle curve points
export function generateHypeCycle(timeRange: number = 20, points: number = 100, startTime: number = -10): CurvePoint[] {
  const curve: CurvePoint[] = [];
  const totalRange = timeRange + Math.abs(startTime);
  
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * totalRange + startTime;
    
    // Hype cycle mathematical model
    // Peak of inflated expectations around t=2-3
    // Trough of disillusionment around t=8-10
    // Slope of enlightenment and plateau starting around t=12
    
    let value: number;
    
    if (t < 0) {
      // Before technology trigger - minimal baseline value
      value = 0.05;
    } else if (t <= 3) {
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
export function generateSCurve(timeRange: number = 20, points: number = 100, startTime: number = -10): CurvePoint[] {
  const curve: CurvePoint[] = [];
  const totalRange = timeRange + Math.abs(startTime);
  
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * totalRange + startTime;
    
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

// Apply time offset to a curve and interpolate values at original time points
export function offsetCurve(curve: CurvePoint[], offset: number, originalTimes: number[]): CurvePoint[] {
  // Create a map of offset curve for interpolation
  const offsetCurveMap = curve.map(point => ({
    time: point.time + offset,
    value: point.value
  }));
  
  // Interpolate values at original time points
  return originalTimes.map(time => {
    // Find the closest points in the offset curve for interpolation
    let beforePoint = offsetCurveMap[0];
    let afterPoint = offsetCurveMap[offsetCurveMap.length - 1];
    
    for (let i = 0; i < offsetCurveMap.length - 1; i++) {
      if (offsetCurveMap[i].time <= time && offsetCurveMap[i + 1].time >= time) {
        beforePoint = offsetCurveMap[i];
        afterPoint = offsetCurveMap[i + 1];
        break;
      }
    }
    
    // Linear interpolation
    if (beforePoint.time === afterPoint.time) {
      return { time, value: beforePoint.value };
    }
    
    const t = (time - beforePoint.time) / (afterPoint.time - beforePoint.time);
    const value = beforePoint.value + t * (afterPoint.value - beforePoint.value);
    
    return { time, value: Math.max(0, Math.min(1, value)) };
  });
}

// Generate combined curve with all transformations
export function generateCombinedCurve(
  timeOffset: number,
  blendRatio: number,
  timeRange: number = 20,
  points: number = 100,
  startTime: number = -10
): {
  hypeCurve: CurvePoint[];
  sCurve: CurvePoint[];
  combinedCurve: CurvePoint[];
} {
  // Generate base curves with negative time support
  const hypeCurve = generateHypeCycle(timeRange, points, startTime);
  const originalSCurve = generateSCurve(timeRange, points, startTime);
  
  // Get original time points for consistent mapping
  const originalTimes = hypeCurve.map(point => point.time);
  
  // Apply time offset to S-curve and interpolate at original time points
  const sCurve = offsetCurve(originalSCurve, timeOffset, originalTimes);
  
  // Blend curves: 0 = all hype cycle (speculative), 1 = all S-curve (real adoption)
  const combinedCurve = blendCurves(hypeCurve, sCurve, blendRatio);
  
  return {
    hypeCurve,
    sCurve,
    combinedCurve
  };
}