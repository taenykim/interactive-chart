export interface ChartProps {
  selector: string;
  data: any[];
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
