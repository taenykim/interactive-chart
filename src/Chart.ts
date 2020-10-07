import { ChartProps, Elements, ElementScale } from "./types/index";
import { $style } from "./utils/domAPI";
import {
  CHART_RESOLUTION_HEIGHT,
  CHART_RESOLUTION_WIDTH,
  CONTAINER_RATIO,
  MINIMAP_HEIGHT,
  MINIMAP_RESOLUTION_WIDTH,
} from "./constants/index";

// ====================더미데이터

// 제네릭
const generateData = <T>() => {
  const obj = <T>{};
  const values = [300, 600, 900, 1200, 1500, 1800, 2100, 2500];
  for (let i = 0; i < 40; i++) {
    obj[i] = values[Math.floor(Math.random() * values.length)];
  }
  return obj;
};

const data = generateData();

const dataArr = Object.entries(data);
const minMax = [Math.min(...Object.values(data)), Math.max(...Object.values(data))];
const dataPositions = [];
let dataPositionsFlag = false;

// ============================

export default class Chart {
  containerName: string;
  elements: Elements;
  trueChartScale: ElementScale;
  trueMinimapScale: ElementScale;

  moveX: number;
  tempMoveX: number;

  constructor(chartProps: ChartProps) {
    this.initProps(chartProps);
    this.initElement();
    this.initStyle();
    this.initChart();
    this.drawChart(this.moveX);
    this.addChartEventListener();
    this.initMinimap();
    this.drawMinimap();
    this.addMinimapEventListener();
  }
  initProps(chartProps: ChartProps) {
    this.containerName = chartProps.selector;
    this.elements = {
      container: undefined,
      chartContainer: undefined,
      chart: undefined,
      chartTooltip: undefined,
      minimapContainer: undefined,
      minimap: undefined,
      minimapTooltip: undefined,
    };
    this.trueChartScale = {
      width: undefined,
      height: undefined,
    };
  }
  initElement() {
    this.elements.container = document.getElementById(this.containerName);
    this.elements.container.innerHTML = `
    <div id='${this.containerName}-chart-container'>
      <canvas id='${this.containerName}-chart'></canvas>
      <div id='${this.containerName}-chart-tooltip'></div>
    </div>
    <div id='${this.containerName}-minimap-container'>
      <canvas id='${this.containerName}-minimap'></canvas>
      <div id='${this.containerName}-minimap-tooltip'></div>
    </div>
    `;
    this.elements.chartContainer = document.querySelector(`#${this.containerName}-chart-container`);
    this.elements.chart = document.querySelector(`#${this.containerName}-chart`);
    this.elements.chartTooltip = document.querySelector(`#${this.containerName}-chart-tooltip`);
    this.elements.minimapContainer = document.querySelector(`#${this.containerName}-minimap-container`);
    this.elements.minimap = document.querySelector(`#${this.containerName}-minimap`);
    this.elements.minimapTooltip = document.querySelector(`#${this.containerName}-minimap-tooltip`);
  }
  initStyle() {
    const container = this.elements.container;
    const chartContainer = this.elements.chartContainer;
    const chart = this.elements.chart;
    const chartTooltip = this.elements.chartTooltip;
    const minimapContainer = this.elements.minimapContainer;
    const minimap = this.elements.minimap;
    const minimapTooltip = this.elements.minimapTooltip;
    $style(container, {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: `${container.clientWidth * CONTAINER_RATIO}px`,
      backgroundColor: "blue",
    });
    $style(chartContainer, {
      position: "relative",
      width: "inherit",
      height: `${container.clientWidth * (CHART_RESOLUTION_HEIGHT / CHART_RESOLUTION_WIDTH)}px`,
    });
    $style(chart, {
      width: "100%",
      height: "100%",
    });
    $style(chartTooltip, {
      display: "none",
      width: "1px",
      height: "inherit",
      position: "absolute",
      top: "0",
      left: "0",
      backgroundColor: "#333",
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
      width: "1px",
      height: "inherit",
      position: "absolute",
      top: "0",
      left: "0",
      backgroundColor: "#333",
    });
  }
  initChart() {
    const canvas = this.elements.chart;
    canvas.width = CHART_RESOLUTION_WIDTH;
    canvas.height = CHART_RESOLUTION_HEIGHT;
    this.moveX = 0;
    this.tempMoveX = 0;
    const { width: trueChartWidth, height: trueChartHeight } = this.elements.chart.getBoundingClientRect();
    this.trueChartScale = { width: trueChartWidth, height: trueChartHeight };
  }
  drawChart(moveX: number) {
    const canvas = this.elements.chart;
    const ctx = canvas.getContext("2d");

    // draw all white
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const leftPadding = 30;
    const rightPadding = 30;
    const topPadding = 120;
    const bottomPadding = 120;
    const valueYWidth = 200;
    const valueXHeight = 52;
    const valueYCount = 7;
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    const textSize = 15;
    const chartWidth = canvasWidth - leftPadding - rightPadding - valueYWidth;
    const chartHeight = canvasHeight - topPadding - bottomPadding - valueXHeight;
    const limitY = chartHeight / 6;
    const limitX = chartWidth / 5;

    const trueMoveX = (moveX * canvasWidth) / this.trueChartScale.width;

    let x = leftPadding + valueYWidth - trueMoveX;
    let y = canvasHeight - bottomPadding;

    // draw x value
    for (const [key, value] of dataArr) {
      ctx.fillStyle = "black";
      ctx.font = "40px arial";
      ctx.fillText(String(Math.round(Number(key))), x, y);
      // this.ctx.moveTo(leftPadding + 200, y - 15);
      // this.ctx.lineTo(canvasWidth + 200, y - 15);
      // this.ctx.lineWidth = 2;
      // this.ctx.stroke();
      x += limitX;
    }

    let i = 0;
    x = leftPadding + valueYWidth - trueMoveX;

    // draw right padding white
    ctx.beginPath();
    ctx.fillRect(leftPadding + valueYWidth + chartWidth, topPadding, chartWidth, chartHeight);

    // draw chart
    for (const [key, value] of dataArr) {
      const dataY = chartHeight * (value / minMax[1]);
      // ctx.fillText(
      //   key + "(" + value + ")",
      //   x,
      //   i % 2 === 0
      //     ? canvasHeight - topPadding - dataY - 10
      //     : canvasHeight - topPadding - dataY - 10 + 30,
      // );
      ctx.lineTo(x, canvasHeight - bottomPadding - valueXHeight - dataY - 15);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "blue";
      ctx.stroke();
      ctx.beginPath();

      ctx.fillStyle = "blue";
      ctx.arc(x, canvasHeight - bottomPadding - valueXHeight - dataY - 15, 12, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, canvasHeight - bottomPadding - valueXHeight - dataY - 15);
      !dataPositionsFlag &&
        dataPositions.push([
          (x / canvasWidth) * this.trueChartScale.width,
          ((canvasHeight - bottomPadding - valueXHeight - dataY - 15) / canvasHeight) * this.trueChartScale.height,
        ]);
      x += limitX;
      i++;
    }
    dataPositionsFlag = true;

    // draw chart white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(leftPadding + valueYWidth + chartWidth, topPadding, chartWidth, chartHeight);

    y = canvasHeight - bottomPadding - valueXHeight;
    let leftValue = 0;

    // draw left padding & y value white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, leftPadding + valueYWidth, canvasHeight);

    // draw y value
    ctx.strokeStyle = "black";
    for (let i = 0; i < valueYCount; i++) {
      ctx.fillStyle = "black";
      ctx.font = "40px arial";
      ctx.fillText(String(Math.round(leftValue) + "원"), leftPadding, y);
      ctx.moveTo(leftPadding + valueYWidth, y - textSize);
      ctx.lineTo(canvasWidth - rightPadding, y - textSize);
      ctx.lineWidth = 2;
      ctx.stroke();
      leftValue += minMax[1] / 6;
      y -= limitY;
    }
  }
  addChartEventListener() {
    let mousedownFlag: any = false;

    const chartContainer = this.elements.chartContainer;
    chartContainer.addEventListener("mousemove", (e) => {
      const trueChartWidth = this.elements.chart.getBoundingClientRect().width;
      const trueChartHeight = this.elements.chart.getBoundingClientRect().height;
      const canvasWidth = this.elements.chart.width;
      const canvasHeight = this.elements.chart.height;
      if (mousedownFlag) {
        this.tempMoveX = mousedownFlag - e.clientX;
        const chartTooltip = this.elements.chartTooltip;
        chartTooltip.style.left = `${e.clientX}px`;
        this.drawChart(this.moveX + this.tempMoveX);
      } else {
        const chartTooltip = this.elements.chartTooltip;
        chartTooltip.style.display = `block`;
        chartTooltip.style.left = `${e.clientX}px`;
        this.drawChart(this.moveX);

        dataPositions.forEach((item) => {
          if (e.clientX > item[0] - 6 && e.clientX < item[0] + 6) {
            this.elements.chart
              .getContext("2d")
              .fillText("text", (item[0] * canvasWidth) / trueChartWidth, (item[1] * canvasHeight) / trueChartHeight);
          }
        });
      }
    });

    chartContainer.addEventListener("mousedown", (e) => {
      mousedownFlag = e.clientX;
    });
    chartContainer.addEventListener("mouseup", (e) => {
      mousedownFlag = false;
      this.moveX += this.tempMoveX;
      dataPositions.forEach((item) => {
        item[0] -= this.tempMoveX;
      });
      this.tempMoveX = 0;
    });
    chartContainer.addEventListener("mouseleave", () => {
      const chartTooltip = this.elements.chartTooltip;
      this.drawChart(this.moveX);
      chartTooltip.style.display = `none`;
      mousedownFlag = false;
      this.moveX += this.tempMoveX;
      dataPositions.forEach((item) => {
        item[0] -= this.tempMoveX;
      });
      this.tempMoveX = 0;
      this.drawChart(this.moveX);
    });
  }
  initMinimap() {
    const canvas = this.elements.minimap;
    canvas.width = MINIMAP_RESOLUTION_WIDTH;
    const { width: trueMinimapWidth, height: trueMinimapHeight } = this.elements.minimap.getBoundingClientRect();
    canvas.height = (CHART_RESOLUTION_WIDTH * trueMinimapHeight) / trueMinimapWidth;
    this.trueMinimapScale = { width: trueMinimapWidth, height: trueMinimapHeight };
  }
  drawMinimap() {
    const canvas = this.elements.minimap;
    const ctx = canvas.getContext("2d");

    // draw all white
    ctx.fillStyle = "#eee";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const leftPadding = 30;
    const rightPadding = 30;
    const topPadding = 30;
    const bottomPadding = 60;
    const textSize = 40;
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    const minimapWidth = canvasWidth - leftPadding - rightPadding;
    const minimapHeight = canvasHeight - topPadding - bottomPadding;
    const limitX = minimapWidth / (dataArr.length - 1);

    // draw true minimap stroke
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(leftPadding, topPadding, minimapWidth, minimapHeight);

    let i = 0;
    let x = leftPadding;

    // draw minimap
    for (const [key, value] of dataArr) {
      const dataY = minimapHeight * (value / minMax[1]);
      // ctx.fillText(
      //   key + "(" + value + ")",
      //   x,
      //   i % 2 === 0
      //     ? canvasHeight - topPadding - dataY - 10
      //     : canvasHeight - topPadding - dataY - 10 + 30,
      // );
      ctx.lineTo(x, canvasHeight - bottomPadding - dataY);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "green";
      ctx.stroke();
      ctx.beginPath();

      ctx.fillStyle = "green";
      ctx.arc(x, canvasHeight - bottomPadding - dataY, 7, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, canvasHeight - bottomPadding - dataY);
      !dataPositionsFlag &&
        dataPositions.push([
          (x / canvasWidth) * this.trueChartScale.width,
          ((canvasHeight - bottomPadding - dataY) / canvasHeight) * this.trueChartScale.height,
        ]);
      x += limitX;
      i++;
    }

    x = leftPadding - textSize / 2;
    let y = canvasHeight - bottomPadding + textSize;

    // draw x value
    for (const [key, value] of dataArr) {
      if (Number(key) % 3 === 0) {
        ctx.fillStyle = "black";
        ctx.font = "40px arial";
        ctx.fillText(String(Math.round(Number(key))), x, y);
        // this.ctx.moveTo(leftPadding + 200, y - 15);
        // this.ctx.lineTo(canvasWidth + 200, y - 15);
        // this.ctx.lineWidth = 2;
        // this.ctx.stroke();
      }
      x += limitX;
    }
  }
  addMinimapEventListener() {
    const minimapContainer = this.elements.minimapContainer;
    minimapContainer.addEventListener("mousemove", (e) => {
      const minimapTooltip = this.elements.minimapTooltip;
      minimapTooltip.style.display = `block`;
      minimapTooltip.style.left = `${e.clientX}px`;
    });
    minimapContainer.addEventListener("mouseleave", () => {
      const minimapTooltip = this.elements.minimapTooltip;
      minimapTooltip.style.display = `none`;
    });
  }
}
