/**
 * @function ExpenseDataPoint
 * A single data point in the expense breakdown chart.
 */
export interface ExpenseDataPoint {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

/**
 * @function ExpenseChartProps
 * Props for the ExpenseChart component.
 */
export interface ExpenseChartProps {
  data: Array<ExpenseDataPoint>;
}
