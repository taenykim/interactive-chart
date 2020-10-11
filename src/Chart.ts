import { ChartProps, Elements, ElementScale } from "./types/index";
import { $style } from "./utils/domAPI";
import {
  CHART_RESOLUTION_HEIGHT,
  CHART_RESOLUTION_WIDTH,
  MINIMAP_HEIGHT,
  MINIMAP_RESOLUTION_WIDTH,
} from "./constants/index";
import {
  canvasLengthToTrueLength,
  chartLengthToMinimapLength,
  minimapLengthToChartLength,
  trueLengthToCanvasLength,
} from "./utils/resize";

export default class Chart {
  chartTitle: string;
  containerName: string;
  elements: Elements;
  trueChartCanvasSize: ElementScale;
  trueMinimapCanvasSize: ElementScale;
  chartSize: ElementScale;
  minimapSize: ElementScale;

  dataContents: any[];
  data: any[];
  minMax: any;
  abs: any;

  moveX: number;
  tempMoveX: number;

  visibleMoveX: number;
  tempVisibleMoveX: number;

  chartRatio: number;
  tempChartRatio: number;

  dataPositions: any[];
  minimapPositions: any[];

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
    this.chartTitle = chartProps.chartTitle;

    const makeData = <T>(datas) => {
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

    const makeDataContents = (datas) => {
      const data = [];
      datas.forEach((monthItem) => {
        monthItem.data.forEach((dateItem) => {
          const contents = dateItem.data;
          data.push(contents);
        });
      });
      return data;
    };

    this.dataContents = makeDataContents(chartProps.data);
    this.data = makeData(chartProps.data);
    this.minMax = [Math.min(...Object.values(this.data)), Math.max(...Object.values(this.data))];
    this.abs = Math.max(...this.minMax.map((item) => Math.abs(item)));
  }
  insertHTML() {
    this.elements.container = document.getElementById(this.containerName);
    this.elements.container.innerHTML = `
    <div id='${this.containerName}-chart-title'>${this.chartTitle}</div>
    <div style="width:inherit; height:inherit; padding:6px 0px 6px 0px">
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
      padding: "6px 0px 6px 0px",
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
      pointerEvents: "none",
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
      padding: "8px 8px 8px 8px",
      border: "4px solid dodgerblue",
      borderRadius: "4px",
      opacity: "0.75",
    });
    $style(minimapContainer, {
      position: "relative",
      width: "inherit",
      height: `${container.clientWidth * (MINIMAP_HEIGHT / CHART_RESOLUTION_WIDTH)}px`,
    });
    $style(minimap, {
      width: "100%",
      height: "100%",
    });
    $style(minimapTooltip, {
      display: "none",
      fontSize: "30px",
      position: "absolute",
      top: "0",
      left: "0",
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
    const LIMIT_X = (CHART_WIDTH / (Object.keys(this.data).length - 1)) * (1 / this.chartRatio || 10);
    const TOTAL_CHART_WIDTH = LIMIT_X * (Object.keys(this.data).length - 1);

    const chartRatio = this.chartRatio || CHART_WIDTH / TOTAL_CHART_WIDTH;
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
    let dataLimit = Math.round(Object.keys(this.data).length / 52);

    let i = 0;
    for (const key in this.data) {
      if (this.chartRatio > 0.75) {
        if (i % (dataLimit * 4) === 0) {
          ctx.fillStyle = "#333";
          key.split("/")[1] === "1" ? (ctx.font = "bold 40px arial") : (ctx.font = "40px arial");
          ctx.fillRect(x, y - X_VALUE_HEIGHT - 14, 2, 20);
          ctx.fillText(key, x, y);
        }
      } else if (this.chartRatio > 0.2) {
        if (i % (dataLimit * 2) === 0) {
          ctx.fillStyle = "#333";
          key.split("/")[1] === "1" ? (ctx.font = "bold 40px arial") : (ctx.font = "40px arial");
          ctx.fillRect(x, y - X_VALUE_HEIGHT - 14, 2, 20);
          ctx.fillText(key, x, y);
        }
      } else if (this.chartRatio > 0.05) {
        if (i % dataLimit === 0) {
          ctx.fillStyle = "#333";
          key.split("/")[1] === "1" ? (ctx.font = "bold 40px arial") : (ctx.font = "40px arial");
          ctx.fillRect(x, y - X_VALUE_HEIGHT - 14, 2, 20);
          ctx.fillText(key, x, y);
        }
      } else {
        ctx.fillStyle = "#333";
        key.split("/")[1] === "1" ? (ctx.font = "bold 40px arial") : (ctx.font = "40px arial");
        ctx.fillRect(x, y - X_VALUE_HEIGHT - 14, 2, 20);
        ctx.fillText(key, x, y);
      }
      x += LIMIT_X;
      i++;
    }

    /**
     * Draw Line Chart
     */
    const newDataPositions = [];
    x = LEFT_PADDING + Y_VALUE_WIDTH - trueMoveX - trueVisibleMoveX;
    for (const key in this.data) {
      if (this.chartRatio > 0.7) {
        ctx.lineWidth = 5;
      } else if (this.chartRatio > 0.2) {
        ctx.lineWidth = 7;
      } else {
        ctx.lineWidth = 10;
      }
      const valueInChart = CHART_HEIGHT / 2 + (CHART_HEIGHT / 2) * (this.data[key] / this.abs);
      const chartDataY = CANVAS_HEIGHT - BOTTOM_PADDING - X_VALUE_HEIGHT - valueInChart - 15;
      ctx.lineTo(x, chartDataY);
      ctx.strokeStyle = "dodgerblue";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, chartDataY);
      // If data position pushed, don't execute

      newDataPositions.push([
        canvasLengthToTrueLength(x, CANVAS_WIDTH, this.trueChartCanvasSize.width),
        canvasLengthToTrueLength(chartDataY, CANVAS_HEIGHT, this.trueChartCanvasSize.height),
      ]);
      x += LIMIT_X;
    }
    this.dataPositions = newDataPositions;

    /**
     * Draw Arc Point
     */
    x = LEFT_PADDING + Y_VALUE_WIDTH - trueMoveX - trueVisibleMoveX;
    for (const key in this.data) {
      if (this.chartRatio > 0.7) {
        break;
      }
      const valueInChart = CHART_HEIGHT / 2 + (CHART_HEIGHT / 2) * (this.data[key] / this.abs);
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
    ctx.fillStyle = "#fff";
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
    let leftValue = -this.abs;
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
      leftValue += this.abs / 3;
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
    const LIMIT_X = MINIMAP_WIDTH / (Object.keys(this.data).length - 1);

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
    ctx.fillStyle = "rgb(225, 232, 252)";
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
    this.minimapPositions = [
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
    for (const key in this.data) {
      const valueInChart = MINIMAP_HEIGHT / 2 + (MINIMAP_HEIGHT / 2) * (this.data[key] / this.abs);
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
    for (const key in this.data) {
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
        if (e.target !== this.elements.chart) return;
        if (mousedownFlag) {
          this.tempMoveX = mousedownFlag - e.offsetX;
          const chartVerticalTooltip = this.elements.chartVerticalTooltip;
          const chartHorizontalTooltip = this.elements.chartHorizontalTooltip;
          chartVerticalTooltip.style.left = `${e.offsetX}px`;
          chartHorizontalTooltip.style.top = `${e.offsetY}px`;

          this.drawChart(this.moveX + this.tempMoveX, this.visibleMoveX);
          this.drawMinimap(this.moveX + this.tempMoveX, this.visibleMoveX);
        } else {
          const chartVerticalTooltip = this.elements.chartVerticalTooltip;
          const chartHorizontalTooltip = this.elements.chartHorizontalTooltip;
          chartVerticalTooltip.style.display = `block`;
          chartHorizontalTooltip.style.display = `block`;
          chartHorizontalTooltip.style.top = `${e.offsetY}px`;
          this.drawChart(this.moveX, this.visibleMoveX);
          this.drawMinimap(this.moveX, this.visibleMoveX);
        }

        const chartInformation = this.elements.chartInformation;
        const chartHorizontalValue = this.elements.chartHorizontalValue;
        chartInformation.style.left = `${e.offsetX + 20}px`;
        chartInformation.style.top = `${e.offsetY + 20}px`;
        chartHorizontalValue.style.display = "block";
        chartHorizontalValue.style.left = `0px`;
        chartHorizontalValue.style.top = `${e.offsetY}px`;
        chartHorizontalValue.innerHTML = ``;
        if (
          e.offsetY >
            canvasLengthToTrueLength(
              1080 - 120 - 52 - 15 - (this.chartSize.height / 6) * 6,
              1080,
              this.trueChartCanvasSize.height,
            ) &&
          e.offsetY < canvasLengthToTrueLength(1080 - 120 - 52 - 15, 1080, this.trueChartCanvasSize.height)
        ) {
          const start = canvasLengthToTrueLength(
            1080 - 120 - 52 - 15 - (this.chartSize.height / 6) * 6,
            1080,
            this.trueChartCanvasSize.height,
          );
          const end = canvasLengthToTrueLength(1080 - 120 - 52 - 15, 1080, this.trueChartCanvasSize.height);

          chartHorizontalValue.innerHTML = `${Math.round(
            this.abs - ((e.offsetY - start) / (end - start)) * this.abs * 2,
          )}`;
        }

        const chartVerticalTooltip = this.elements.chartVerticalTooltip;
        this.dataPositions.forEach((item, i) => {
          if (e.offsetX > item[0] - 6 && e.offsetX < item[0] + 6) {
            const chartInformationHTML =
              this.dataContents[i].reduce((acc, cur) => {
                return (
                  acc +
                  `<div style="display:flex; justify-content:space-between;"><div>${cur.type}</div><div style='padding-left:12px'>${cur.amount}</div></div>`
                );
              }, `<div style="color:#000; font-weight:bold; text-align:center; padding:2px 0px 2px 0px">${Object.keys(this.data)[i]}</div>`) +
              `<div style="font-weight:bold; margin-top:6px">총 금액 : ${this.dataContents[i].reduce((acc, cur) => {
                return acc + cur.amount;
              }, 0)}</div>`;
            chartInformation.style.display = "block";
            chartVerticalTooltip.style.left = `${item[0]}px`;
            chartInformation.innerHTML = chartInformationHTML;
          }
        });
      });

      chartContainer.addEventListener("mousedown", (e) => {
        mousedownFlag = e.offsetX;
      });
      chartContainer.addEventListener("mouseup", (e) => {
        this.dataPositions.forEach((item) => {
          item[0] -= this.tempMoveX;
        });
        this.moveX += this.tempMoveX;

        mousedownFlag = null;
        this.tempMoveX = 0;
      });
      chartContainer.addEventListener("mouseleave", () => {
        this.dataPositions.forEach((item) => {
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
      let rightResizeFlag = false;
      let leftResizeFlag = false;
      let moveFlag = false;
      minimapContainer.addEventListener("mousemove", (e) => {
        if (rightResizeFlag) {
          const moveRatio =
            -(mousedownFlag - e.offsetX) /
            canvasLengthToTrueLength(this.minimapSize.width, 1920, this.trueMinimapCanvasSize.width);
          this.chartRatio = this.tempChartRatio + moveRatio;
          this.drawChart(this.moveX, this.visibleMoveX + this.tempVisibleMoveX);
          this.drawMinimap(this.moveX, this.visibleMoveX + this.tempVisibleMoveX);
        }
        if (leftResizeFlag) {
          const moveRatio =
            (mousedownFlag - e.offsetX) /
            canvasLengthToTrueLength(this.minimapSize.width, 1920, this.trueMinimapCanvasSize.width);
          this.chartRatio = this.tempChartRatio + moveRatio;
          this.tempVisibleMoveX = mousedownFlag - e.offsetX;
          this.drawChart(this.moveX, this.visibleMoveX + this.tempVisibleMoveX);
          this.drawMinimap(this.moveX, this.visibleMoveX + this.tempVisibleMoveX);
        }
        if (moveFlag) {
          this.tempVisibleMoveX = mousedownFlag - e.offsetX;
          this.drawChart(this.moveX, this.visibleMoveX + this.tempVisibleMoveX);
          this.drawMinimap(this.moveX, this.visibleMoveX + this.tempVisibleMoveX);
        }
        minimapContainer.style.cursor = "default";
        if (e.offsetX > this.minimapPositions[0] - 3 && e.offsetX < this.minimapPositions[0] + 3) {
          minimapContainer.style.cursor = "ew-resize";
        }
        if (e.offsetX > this.minimapPositions[1] - 3 && e.offsetX < this.minimapPositions[1] + 3) {
          minimapContainer.style.cursor = "ew-resize";
        }
        if (e.offsetX > this.minimapPositions[0] + 3 && e.offsetX < this.minimapPositions[1] - 3) {
          minimapContainer.style.cursor = "grab";
        }
      });
      minimapContainer.addEventListener("mousedown", (e) => {
        mousedownFlag = e.offsetX;
        this.tempChartRatio = this.chartRatio;
        if (e.offsetX > this.minimapPositions[0] - 3 && e.offsetX < this.minimapPositions[0] + 3) {
          leftResizeFlag = true;
        }
        if (e.offsetX > this.minimapPositions[1] - 3 && e.offsetX < this.minimapPositions[1] + 3) {
          rightResizeFlag = true;
        }
        if (e.offsetX > this.minimapPositions[0] + 3 && e.offsetX < this.minimapPositions[1] - 3) {
          if (mousedownFlag) {
            moveFlag = true;
          }
        }
      });
      minimapContainer.addEventListener("mouseup", () => {
        leftResizeFlag = false;
        rightResizeFlag = false;
        moveFlag = false;

        this.dataPositions.forEach((item) => {
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
        this.tempChartRatio = 0;
      });
      minimapContainer.addEventListener("mouseleave", () => {
        leftResizeFlag = false;
        rightResizeFlag = false;
        moveFlag = false;

        this.dataPositions.forEach((item) => {
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
