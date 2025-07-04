import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { generateCombinedCurve } from '@/lib/curves';

export default function CurveVisualization() {
  const [timeOffset, setTimeOffset] = useState([0]);
  const [blendRatio, setBlendRatio] = useState([0.5]);

  // Generate curve data based on current slider values
  const curveData = useMemo(() => {
    const { hypeCurve, sCurve, combinedCurve } = generateCombinedCurve(
      timeOffset[0],
      blendRatio[0],
      20,
      200
    );

    // Combine all curves into chart data format
    const chartData = hypeCurve.map((point, index) => ({
      time: point.time,
      hype: point.value,
      scurve: sCurve[index]?.value || 0,
      combined: combinedCurve[index]?.value || 0,
    }));

    return chartData;
  }, [timeOffset[0], blendRatio[0]]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Technology Adoption Curves
          </h1>
          <p className="text-xl text-muted-foreground">
            Interactive visualization of Hype Cycle vs S-Curve adoption patterns
          </p>
        </div>

        {/* Main Chart */}
        <Card className="p-6">
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curveData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Time', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Perceived Value', angle: -90, position: 'insideLeft' }}
                  domain={[0, 1]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="hype"
                  stroke="hsl(var(--chart-hype))"
                  strokeWidth={2}
                  dot={false}
                  name="Hype Cycle (Speculative)"
                />
                <Line
                  type="monotone"
                  dataKey="scurve"
                  stroke="hsl(var(--chart-scurve))"
                  strokeWidth={2}
                  dot={false}
                  name="S-Curve (Real Adoption)"
                />
                <Line
                  type="monotone"
                  dataKey="combined"
                  stroke="hsl(var(--chart-combined))"
                  strokeWidth={3}
                  dot={false}
                  name="Combined Curve"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Time Offset Slider */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Time Offset
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Shift the S-Curve relative to the Hype Cycle
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>-10</span>
                  <span className="text-foreground font-medium">
                    {timeOffset[0].toFixed(1)}
                  </span>
                  <span>+10</span>
                </div>
                <Slider
                  value={timeOffset}
                  onValueChange={setTimeOffset}
                  min={-10}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          {/* Blend Ratio Slider */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Real vs Speculative Value
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Balance between hype-driven and adoption-driven value
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Speculative</span>
                  <span className="text-foreground font-medium">
                    {(blendRatio[0] * 100).toFixed(0)}% Real
                  </span>
                  <span>Real</span>
                </div>
                <Slider
                  value={blendRatio}
                  onValueChange={setBlendRatio}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-chart-hype mb-2">
              Hype Cycle
            </h4>
            <p className="text-sm text-muted-foreground">
              Represents speculative value driven by expectations, featuring rapid growth, 
              disillusionment, and gradual recovery based on realistic assessment.
            </p>
          </Card>
          
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-chart-scurve mb-2">
              S-Curve Adoption
            </h4>
            <p className="text-sm text-muted-foreground">
              Models real-world technology adoption with slow initial uptake, 
              rapid growth phase, and eventual market saturation plateau.
            </p>
          </Card>
          
          <Card className="p-6">
            <h4 className="text-lg font-semibold text-chart-combined mb-2">
              Combined Model
            </h4>
            <p className="text-sm text-muted-foreground">
              Blends both curves to show how perceived value evolves when 
              considering both speculative excitement and practical adoption.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}