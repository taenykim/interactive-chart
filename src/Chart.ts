// 미니맵과 차트 좌표 변환 함수 만들기

import { ChartProps, Elements, ElementScale } from "./types/index";
import { $style } from "./utils/domAPI";
import {
  CHART_RESOLUTION_HEIGHT,
  CHART_RESOLUTION_WIDTH,
  CONTAINER_RATIO,
  MINIMAP_HEIGHT,
  MINIMAP_RESOLUTION_WIDTH,
} from "./constants/index";
import { chartMousemoveEvent } from "./events/chartMousemoveEvent";
import { minimapMousemoveEvent } from "./events/minimapMousemoveEvent";
import {
  canvasLengthToTrueLength,
  chartLengthToMinimapLength,
  minimapLengthToChartLength,
  trueLengthToCanvasLength,
} from "./utils/resize";
const datas = require("./data/data.json");

// ====================더미데이터

const makeData = <T>() => {
  const data = <T>{};
  datas.forEach((monthItem) => {
    monthItem.data.forEach((dateItem) => {
      let amount = 0;
      dateItem.data.forEach((data) => {
        amount += data.amount;
      });
      data[`${monthItem.month}/${dateItem.date}`] = amount;
    });
  });
  return data;
};

const makeDataContents = () => {
  const data = [];
  datas.forEach((monthItem) => {
    monthItem.data.forEach((dateItem) => {
      const contents = dateItem.data;
      data.push(contents);
    });
  });
  return data;
};

const dataContents = makeDataContents();

const data: object = makeData();

// const data = {
//   0: -500,
//   1: 1000,
//   2: -1500,
//   3: 2000,
// };

const minMax = [Math.min(...Object.values(data)), Math.max(...Object.values(data))];
const abs = Math.max(...minMax.map((item) => Math.abs(item)));
const dataPositions = [];
let dataPositionsFlag = false;
let minimapPositions = [];

// ============================

export default class Chart {
  containerName: string;
  elements: Elements;
  trueChartCanvasSize: ElementScale;
  trueMinimapCanvasSize: ElementScale;
  chartSize: ElementScale;
  minimapSize: ElementScale;

  moveX: number;
  tempMoveX: number;

  visibleMoveX: number;
  tempVisibleMoveX: number;

  chartRatio: number;

  constructor(chartProps: ChartProps) {
    this.initProps(chartProps);
    this.insertHTML();
    this.initElement();
    this.initStyle();
    this.initChart();
    this.initMinimap();
    this.drawChart(this.moveX, this.visibleMoveX);
    this.drawMinimap(this.moveX, this.visibleMoveX);
    this.addEventListener();
  }
  initProps(chartProps: ChartProps) {
    this.containerName = chartProps.selector;
    this.elements = {
      container: undefined,
      chartContainer: undefined,
      chart: undefined,
      chartTitle: undefined,
      chartVerticalTooltip: undefined,
      chartHorizontalTooltip: undefined,
      chartHorizontalValue: undefined,
      chartInformation: undefined,
      minimapContainer: undefined,
      minimap: undefined,
      minimapTitle: undefined,
      minimapTooltip: undefined,
    };
  }
  insertHTML() {
    this.elements.container = document.getElementById(this.containerName);
    this.elements.container.innerHTML = `
    <div id='${this.containerName}-chart-title'>Accountbook Line Chart</div>
    <div style="width:inherit; height:inherit;">
      <div id='${this.containerName}-chart-container'>
        <div id='${this.containerName}-chart-vertical-tooltip'></div>
        <div id='${this.containerName}-chart-horizontal-tooltip'></div>
        <div id='${this.containerName}-chart-horizontal-value'></div>
        <div id='${this.containerName}-chart-information'></div>
        <canvas id='${this.containerName}-chart'></canvas>
      </div>
      <div id='${this.containerName}-minimap-container'>
        <canvas id='${this.containerName}-minimap'></canvas>
        <div id='${this.containerName}-minimap-tooltip'>
      </div>
    </div>
    `;
  }
  initElement() {
    this.elements.chartContainer = document.querySelector(`#${this.containerName}-chart-container`);
    this.elements.chart = document.querySelector(`#${this.containerName}-chart`);
    this.elements.chartTitle = document.querySelector(`#${this.containerName}-chart-title`);
    this.elements.chartHorizontalTooltip = document.querySelector(`#${this.containerName}-chart-horizontal-tooltip`);
    this.elements.chartVerticalTooltip = document.querySelector(`#${this.containerName}-chart-vertical-tooltip`);
    this.elements.chartHorizontalValue = document.querySelector(`#${this.containerName}-chart-horizontal-value`);
    this.elements.chartInformation = document.querySelector(`#${this.containerName}-chart-information`);
    this.elements.minimapContainer = document.querySelector(`#${this.containerName}-minimap-container`);
    this.elements.minimap = document.querySelector(`#${this.containerName}-minimap`);
    this.elements.minimapTooltip = document.querySelector(`#${this.containerName}-minimap-tooltip`);
  }
  initStyle() {
    const container = this.elements.container;
    const chartContainer = this.elements.chartContainer;
    const chart = this.elements.chart;
    const chartTitle = this.elements.chartTitle;
    const chartVerticalTooltip = this.elements.chartVerticalTooltip;
    const chartHorizontalTooltip = this.elements.chartHorizontalTooltip;
    const chartHorizontalValue = this.elements.chartHorizontalValue;
    const chartInformation = this.elements.chartInformation;
    const minimapContainer = this.elements.minimapContainer;
    const minimap = this.elements.minimap;
    const minimapTooltip = this.elements.minimapTooltip;
    $style(container, {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: `${container.clientWidth * CONTAINER_RATIO}px`,
    });
    $style(chartContainer, {
      position: "relative",
      width: "inherit",
      height: `${container.clientWidth * (CHART_RESOLUTION_HEIGHT / CHART_RESOLUTION_WIDTH)}px`,
      userSelect: "none",
    });
    $style(chart, {
      width: "100%",
      height: "100%",
      userSelect: "none",
      zIndex: 100,
    });
    $style(chartTitle, {
      width: "inherit",
      height: "100%",
      fontSize: "32px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold",
      color: "black",
      textShadow: "2px 2px 4px grey",
      userSelect: "none",
    });
    $style(chartVerticalTooltip, {
      display: "none",
      width: "1px",
      height: "inherit",
      position: "absolute",
      top: "0",
      left: "0",
      borderLeft: "1px dashed #333",
      userSelect: "none",
      pointerEvents: "none",
    });
    $style(chartHorizontalTooltip, {
      display: "none",
      height: "1px",
      width: "inherit",
      position: "absolute",
      top: "0",
      left: "0",
      borderTop: "1px dashed #333",
      userSelect: "none",
      pointerEvents: "none",
    });
    $style(chartHorizontalValue, {
      display: "none",
      position: "absolute",
      top: "0",
      left: "0",
      backgroundColor: "#000",
      color: "#fff",
      userSelect: "none",
    });
    $style(chartInformation, {
      zIndex: "10",
      display: "none",
      flexDirection: "column",
      width: "fit-content",
      height: "auto",
      position: "absolute",
      top: "0",
      left: "0",
      backgroundColor: "white",
      userSelect: "none",
      padding: "8px",
      border: "4px solid dodgerblue",
      borderRadius: "4px",
      opacity: "0.75",
    });
    $style(minimapContainer, {
      position: "relative",
      width: "inherit",
      height: `${MINIMAP_HEIGHT}px`,
    });
    $style(minimap, {
      width: "100%",
      height: "100%",
    });
    $style(minimapTooltip, {
      display: "none",
      // width: "1px",
      // height: "inherit",
      fontSize: "30px",
      position: "absolute",
      top: "0",
      left: "0",
      // backgroundColor: "#333",
      pointerEvents: "none",
    });
  }
  initChart() {
    const canvas = this.elements.chart;
    canvas.width = CHART_RESOLUTION_WIDTH;
    canvas.height = CHART_RESOLUTION_HEIGHT;
    this.moveX = 0;
    this.tempMoveX = 0;
    this.visibleMoveX = 0;
    this.tempVisibleMoveX = 0;
    const { width: trueChartWidth, height: trueChartHeight } = this.elements.chart.getBoundingClientRect();
    this.trueChartCanvasSize = { width: trueChartWidth, height: trueChartHeight };
  }
  drawChart(moveX: number, visibleMoveX: number) {
    const canvas = this.elements.chart;
    const ctx = canvas.getContext("2d");

    /**
     * Draw all canvas white
     */
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /**
     * Chart constants Informations
     */

    const LEFT_PADDING = 30;
    const RIGHT_PADDING = 30;
    const TOP_PADDING = 120;
    const BOTTOM_PADDING = 120;
    const Y_VALUE_WIDTH = 200;
    const X_VALUE_HEIGHT = 52;
    const Y_VALUE_COUNT = 7;
    const CANVAS_HEIGHT = canvas.height;
    const CANVAS_WIDTH = canvas.width;
    const TEXT_SIZE = 15;
    const CHART_WIDTH = CANVAS_WIDTH - LEFT_PADDING - RIGHT_PADDING - Y_VALUE_WIDTH;
    const CHART_HEIGHT = CANVAS_HEIGHT - TOP_PADDING - BOTTOM_PADDING - X_VALUE_HEIGHT;

    const LIMIT_Y = CHART_HEIGHT / 6;
    const LIMIT_X = CHART_WIDTH / 10;
    const TOTAL_CHART_WIDTH = LIMIT_X * (Object.keys(data).length - 1);

    const chartRatio = CHART_WIDTH / TOTAL_CHART_WIDTH;
    this.chartRatio = chartRatio;
    this.chartSize = { width: CHART_WIDTH, height: CHART_HEIGHT };

    const trueVisibleMoveX = minimapLengthToChartLength(
      -trueLengthToCanvasLength(visibleMoveX, CANVAS_WIDTH, this.trueChartCanvasSize.width),
      this.chartSize.width,
      1920 - 60,
      chartRatio,
    );

    const trueMoveX = trueLengthToCanvasLength(moveX, CANVAS_WIDTH, this.trueChartCanvasSize.width);

    let x: number;
    let y: number;
    ctx.beginPath();

    /**
     * Draw X Axis
     */
    x = LEFT_PADDING + Y_VALUE_WIDTH - trueMoveX - trueVisibleMoveX;
    y = CANVAS_HEIGHT - BOTTOM_PADDING;
    for (const key in data) {
      ctx.fillStyle = "#333";
      key.split("/")[1] === "1" ? (ctx.font = "bold 40px arial") : (ctx.font = "40px arial");
      ctx.fillRect(x, y - X_VALUE_HEIGHT - 14, 2, 20);
      ctx.fillText(key, x, y);
      x += LIMIT_X;
    }

    /**
     * Draw Line Chart
     */
    x = LEFT_PADDING + Y_VALUE_WIDTH - trueMoveX - trueVisibleMoveX;
    for (const key in data) {
      const valueInChart = CHART_HEIGHT / 2 + (CHART_HEIGHT / 2) * (data[key] / abs);
      const chartDataY = CANVAS_HEIGHT - BOTTOM_PADDING - X_VALUE_HEIGHT - valueInChart - 15;
      ctx.lineTo(x, chartDataY);
      ctx.lineWidth = 10;
      ctx.strokeStyle = "dodgerblue";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, chartDataY);
      // If data position pushed, don't execute
      !dataPositionsFlag &&
        dataPositions.push([
          canvasLengthToTrueLength(x, CANVAS_WIDTH, this.trueChartCanvasSize.width),
          canvasLengthToTrueLength(chartDataY, CANVAS_HEIGHT, this.trueChartCanvasSize.height),
        ]);
      x += LIMIT_X;
    }
    dataPositionsFlag = true;

    /**
     * Draw Arc Point
     */
    x = LEFT_PADDING + Y_VALUE_WIDTH - trueMoveX - trueVisibleMoveX;
    for (const key in data) {
      const valueInChart = CHART_HEIGHT / 2 + (CHART_HEIGHT / 2) * (data[key] / abs);
      const chartDataY = CANVAS_HEIGHT - BOTTOM_PADDING - X_VALUE_HEIGHT - valueInChart - 15;
      ctx.fillStyle = "dodgerblue";
      ctx.arc(x, chartDataY, 12, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.beginPath();

      ctx.fillStyle = "#fff";
      ctx.arc(x, CANVAS_HEIGHT - BOTTOM_PADDING - X_VALUE_HEIGHT - valueInChart - 15, 9, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.beginPath();
      x += LIMIT_X;
    }

    /**
     * Draw Right Padding White
     */
    ctx.beginPath();
    ctx.fillRect(LEFT_PADDING + Y_VALUE_WIDTH + CHART_WIDTH, TOP_PADDING, CHART_WIDTH, CHART_HEIGHT);

    /**
     * Draw Left Padding & Y Value Width White
     */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, LEFT_PADDING + Y_VALUE_WIDTH, CANVAS_HEIGHT);

    /**
     * Draw Y Axis
     */
    y = CANVAS_HEIGHT - BOTTOM_PADDING - X_VALUE_HEIGHT;
    let leftValue = -abs;
    for (let i = 0; i < Y_VALUE_COUNT; i++) {
      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.font = "40px arial";
      ctx.lineWidth = 2;
      ctx.textAlign = "end";
      ctx.fillText(String(Math.round(leftValue)), Y_VALUE_WIDTH, y);
      ctx.moveTo(LEFT_PADDING + Y_VALUE_WIDTH, y - TEXT_SIZE);
      ctx.lineTo(CANVAS_WIDTH - RIGHT_PADDING, y - TEXT_SIZE);
      ctx.strokeStyle = "#444";
      if (i === 3) ctx.lineWidth = 4;
      ctx.stroke();
      leftValue += abs / 3;
      y -= LIMIT_Y;
    }
    ctx.textAlign = "start";
  }
  initMinimap() {
    const canvas = this.elements.minimap;
    canvas.width = MINIMAP_RESOLUTION_WIDTH;
    const { width: trueMinimapWidth, height: trueMinimapHeight } = this.elements.minimap.getBoundingClientRect();
    canvas.height = (CHART_RESOLUTION_WIDTH * trueMinimapHeight) / trueMinimapWidth;
    this.trueMinimapCanvasSize = { width: trueMinimapWidth, height: trueMinimapHeight };
  }
  drawMinimap(moveX: number, visibleMoveX) {
    const canvas = this.elements.minimap;
    const ctx = canvas.getContext("2d");

    /**
     * Draw all White
     */
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /**
     * Minimap constants Informations
     */
    const LEFT_PADDING = 30;
    const RIGHT_PADDING = 30;
    const TOP_PADDING = 30;
    const BOTTOM_PADDING = 60;
    const TEXT_SIZE = 40;
    const CANVAS_HEIGHT = canvas.height;
    const CANVAS_WIDTH = canvas.width;
    const MINIMAP_WIDTH = CANVAS_WIDTH - LEFT_PADDING - RIGHT_PADDING;
    const MINIMAP_HEIGHT = CANVAS_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
    const LIMIT_X = MINIMAP_WIDTH / (Object.keys(data).length - 1);

    this.minimapSize = { width: MINIMAP_WIDTH, height: MINIMAP_HEIGHT };

    const trueVisibleMoveX = -trueLengthToCanvasLength(visibleMoveX, CANVAS_WIDTH, this.trueChartCanvasSize.width);

    const trueMoveXInChart = trueLengthToCanvasLength(moveX, CANVAS_WIDTH, this.trueChartCanvasSize.width);
    const trueMoveX = chartLengthToMinimapLength(
      trueMoveXInChart,
      this.chartSize.width,
      MINIMAP_WIDTH,
      this.chartRatio,
    );

    let x: number;
    let y: number;
    ctx.beginPath();

    /**
     * Draw Minimap Box
     */
    ctx.fillStyle = "#ddd";
    ctx.fillRect(LEFT_PADDING, TOP_PADDING, MINIMAP_WIDTH, MINIMAP_HEIGHT);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.strokeRect(LEFT_PADDING, TOP_PADDING, MINIMAP_WIDTH, MINIMAP_HEIGHT);

    /**
     * Draw Visible Minimap Box
     */
    ctx.fillStyle = "#fff";
    ctx.fillRect(
      LEFT_PADDING + trueMoveX + trueVisibleMoveX,
      TOP_PADDING,
      MINIMAP_WIDTH * this.chartRatio,
      MINIMAP_HEIGHT,
    );
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.strokeRect(
      LEFT_PADDING + trueMoveX + trueVisibleMoveX,
      TOP_PADDING,
      MINIMAP_WIDTH * this.chartRatio,
      MINIMAP_HEIGHT,
    );
    minimapPositions = [
      canvasLengthToTrueLength(
        LEFT_PADDING + trueMoveX + trueVisibleMoveX,
        CANVAS_WIDTH,
        this.trueMinimapCanvasSize.width,
      ),
      canvasLengthToTrueLength(
        LEFT_PADDING + trueMoveX + trueVisibleMoveX + MINIMAP_WIDTH * this.chartRatio,
        CANVAS_WIDTH,
        this.trueMinimapCanvasSize.width,
      ),
    ];

    /**
     * Draw Minimap
     */
    x = LEFT_PADDING;
    ctx.beginPath();
    for (const key in data) {
      const valueInChart = MINIMAP_HEIGHT / 2 + (MINIMAP_HEIGHT / 2) * (data[key] / abs);
      ctx.lineTo(x, CANVAS_HEIGHT - BOTTOM_PADDING - valueInChart);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "dodgerblue";
      ctx.stroke();

      ctx.fillStyle = "dodgerblue";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, CANVAS_HEIGHT - BOTTOM_PADDING - valueInChart);
      x += LIMIT_X;
    }

    /**
     * Draw X Axis
     */
    x = LEFT_PADDING - TEXT_SIZE / 2;
    y = CANVAS_HEIGHT - BOTTOM_PADDING + TEXT_SIZE;
    for (const key in data) {
      // 1일만 기록
      if (Number(key.split("/")[1]) % 31 === 1) {
        ctx.fillStyle = "black";
        ctx.font = "40px arial";
        ctx.fillText(key, x, y);
      }
      x += LIMIT_X;
    }
  }
  addEventListener() {
    let mousedownFlag: null | number = null;

    const chartEvent = () => {
      const chartContainer = this.elements.chartContainer;
      chartContainer.addEventListener("mousemove", (e) => {
        chartMousemoveEvent(e, this, mousedownFlag, dataPositions, dataContents);
      });

      chartContainer.addEventListener("mousedown", (e) => {
        mousedownFlag = e.offsetX;
      });
      chartContainer.addEventListener("mouseup", (e) => {
        dataPositions.forEach((item) => {
          item[0] -= this.tempMoveX;
        });
        this.moveX += this.tempMoveX;

        mousedownFlag = null;
        this.tempMoveX = 0;
      });
      chartContainer.addEventListener("mouseleave", () => {
        dataPositions.forEach((item) => {
          item[0] -= this.tempMoveX;
        });
        const chartVerticalTooltip = this.elements.chartVerticalTooltip;
        const chartHorizontalTooltip = this.elements.chartHorizontalTooltip;
        const chartInformation = this.elements.chartInformation;
        const chartHorizontalValue = this.elements.chartHorizontalValue;
        chartVerticalTooltip.style.display = `none`;
        chartHorizontalTooltip.style.display = `none`;
        chartInformation.style.display = `none`;
        chartHorizontalValue.style.display = `none`;

        this.moveX += this.tempMoveX;
        this.drawChart(this.moveX, this.visibleMoveX);
        this.drawMinimap(this.moveX, this.visibleMoveX);

        mousedownFlag = null;
        this.tempMoveX = 0;
      });
    };
    const minimapEvent = () => {
      const minimapContainer = this.elements.minimapContainer;
      minimapContainer.addEventListener("mousemove", (e) => {
        minimapMousemoveEvent(e, this, minimapContainer, mousedownFlag, minimapPositions);
      });
      minimapContainer.addEventListener("mousedown", (e) => {
        mousedownFlag = e.offsetX;
      });
      minimapContainer.addEventListener("mouseup", () => {
        dataPositions.forEach((item) => {
          item[0] += canvasLengthToTrueLength(
            minimapLengthToChartLength(
              trueLengthToCanvasLength(this.tempVisibleMoveX, this.chartSize.width, this.trueChartCanvasSize.width),
              this.chartSize.width,
              this.minimapSize.width,
              this.chartRatio,
            ),
            this.chartSize.width,
            this.trueChartCanvasSize.width,
          );
        });
        mousedownFlag = null;
        this.visibleMoveX += this.tempVisibleMoveX;
        this.tempVisibleMoveX = 0;
      });
      minimapContainer.addEventListener("mouseleave", () => {
        dataPositions.forEach((item) => {
          item[0] += canvasLengthToTrueLength(
            minimapLengthToChartLength(
              trueLengthToCanvasLength(this.tempVisibleMoveX, this.chartSize.width, this.trueChartCanvasSize.width),
              this.chartSize.width,
              this.minimapSize.width,
              this.chartRatio,
            ),
            this.chartSize.width,
            this.trueChartCanvasSize.width,
          );
        });
        this.visibleMoveX += this.tempVisibleMoveX;
        this.drawChart(this.moveX, this.visibleMoveX);
        this.drawMinimap(this.moveX, this.visibleMoveX);

        mousedownFlag = null;
        this.tempVisibleMoveX = 0;
      });
    };

    chartEvent();
    minimapEvent();
  }
}
