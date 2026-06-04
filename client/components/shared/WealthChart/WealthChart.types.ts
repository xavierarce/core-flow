/**
 * @function WealthDataPoint
 * A single data point in the wealth allocation chart.
 */
export interface WealthDataPoint {
  name: string;
  value: number;
  [key: string]: unknown;
}

/**
 * @function WealthChartProps
 * Props for the WealthChart component.
 */
export interface WealthChartProps {
  data: Array<WealthDataPoint>;
}
