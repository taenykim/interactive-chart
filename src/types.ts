export interface ChartProps {
  selector: string;
  chartTitle: string;
  data: any[];
  offsetMonth: number;
}

export interface Elements {
  container: HTMLElement;
  chartContainer: HTMLDivElement;
  chartTitle: HTMLDivElement;
  chart: HTMLCanvasElement;
  chartVerticalTooltip: HTMLDivElement;
  chartHorizontalTooltip: HTMLDivElement;
  chartHorizontalValue: HTMLDivElement;
  chartInformation: HTMLDivElement;
  minimapContainer: HTMLDivElement;
  minimap: HTMLCanvasElement;
  minimapTitle: HTMLDivElement;
  minimapTooltip: HTMLDivElement;
}

export interface ElementScale {
  width: number;
  height: number;
}

/**
 * If this function is removed, interface is not compiled
 */
export const tempFunction = (name) => 23;
