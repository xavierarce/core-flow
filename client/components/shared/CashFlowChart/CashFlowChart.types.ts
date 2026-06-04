/**
 * @function CashFlowDataPoint
 * A single data point in the cash flow chart.
 */
export interface CashFlowDataPoint {
  name: string;
  income: number;
  expense: number;
}

/**
 * @function CashFlowChartProps
 * Props for the CashFlowChart component.
 */
export interface CashFlowChartProps {
  data: Array<CashFlowDataPoint>;
}
