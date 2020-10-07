export interface ChartProps {
  selector: string;
}

export interface Elements {
  container: HTMLElement;
  chartContainer: HTMLDivElement;
  chart: HTMLCanvasElement;
  chartTooltip: HTMLDivElement;
  minimapContainer: HTMLDivElement;
  minimap: HTMLCanvasElement;
  minimapTooltip: HTMLDivElement;
}

export interface ElementScale {
  width: number;
  height: number;
}
