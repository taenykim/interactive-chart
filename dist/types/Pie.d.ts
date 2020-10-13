import { ChartProps } from "./types";
export default class Pie {
    chartProps: ChartProps;
    chartTitle: string;
    containerName: string;
    originalData: any[];
    dataContents: any[];
    data: any[];
    constructor(chartProps: ChartProps);
    initProps(chartProps: ChartProps): void;
    changeData(month: any): void;
    insertHTML(): void;
    initStyle(): void;
    drawChart(): void;
    drawCenterText(): void;
    addEventListener(): void;
}
