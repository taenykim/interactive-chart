import { SeasonColor, SVG_WIDTH, TypeColor } from "./constants";
import { ChartProps } from "./types";
import { $style } from "./utils/domAPI";
import { toPieChartItemPath } from "./utils/toPieChartItemPath";
import { MonthColor } from "./constants/index";

let incomeData = {};
let outlayData = {};

const selectedData = {
  season: undefined,
  month: undefined,
  type: undefined,
  dataType: undefined,
};

export default class Pie {
  chartProps: ChartProps;

  chartTitle: string;
  containerName: string;

  originalData: any[];
  dataContents: any[];
  data: any[];

  constructor(chartProps: ChartProps) {
    this.chartProps = chartProps;
    this.initProps(this.chartProps);
    this.insertHTML();
    this.initStyle();
    this.drawChart();
    this.addEventListener();
  }
  initProps(chartProps: ChartProps) {
    this.containerName = chartProps.selector;
    this.chartTitle = chartProps.chartTitle
    incomeData = {};
    outlayData = {};

    const makeData = <T>(datas) => {
      const data = <T>{};
      datas.forEach((monthItem) => {
        monthItem.data.forEach((dateItem) => {
          let amount = 0;
          dateItem.data.forEach((data) => {
            amount += data.amount;
            if (data.amount >= 0) {
              if (!incomeData[`${data.type}`]) {
                incomeData[`${data.type}`] = data.amount;
              } else {
                incomeData[`${data.type}`] += data.amount;
              }
            } else if (data.amount < 0) {
              if (!outlayData[`${data.type}`]) {
                outlayData[`${data.type}`] = data.amount;
              } else {
                outlayData[`${data.type}`] += data.amount;
              }
            }
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

    this.originalData = chartProps.data;
    this.dataContents = makeDataContents(chartProps.data);
    this.data = makeData(chartProps.data);
  }
  changeData(month) {
    incomeData = {};
    outlayData = {};

    const makeData = <T>(datas, month) => {
      const data = <T>{};
      datas
        .filter((item) => item.month === month)
        .forEach((monthItem) => {
          monthItem.data.forEach((dateItem) => {
            let amount = 0;
            dateItem.data.forEach((data) => {
              amount += data.amount;
              if (data.amount >= 0) {
                if (!incomeData[`${data.type}`]) {
                  incomeData[`${data.type}`] = data.amount;
                } else {
                  incomeData[`${data.type}`] += data.amount;
                }
              } else if (data.amount < 0) {
                if (!outlayData[`${data.type}`]) {
                  outlayData[`${data.type}`] = data.amount;
                } else {
                  outlayData[`${data.type}`] += data.amount;
                }
              }
            });
            data[`${monthItem.month}/${dateItem.date}`] = amount;
          });
        });
      return data;
    };

    const makeDataContents = (datas, month) => {
      const data = [];
      datas
        .filter((item) => item.month === month)
        .forEach((monthItem) => {
          monthItem.data.forEach((dateItem) => {
            const contents = dateItem.data;
            data.push(contents);
          });
        });
      return data;
    };

    this.dataContents = makeDataContents(this.originalData, month);
    this.data = makeData(this.originalData, month);
  }
  insertHTML() {
    const container = <HTMLElement>document.querySelector(`#${this.containerName}`);
    container.innerHTML = `
    <div id="${this.containerName}-text" style='user-select:none; pointer-events:none'>${this.chartTitle}</div>
    <svg id="${this.containerName}-svg" width="500" height="500">
      <circle style='cursor:pointer' id='${this.containerName}-reset-circle' cx=250 cy=250 r=60 fill=#eee />
    ${["SPRING", "SUMMER", "FALL", "WINTER"]
      .map((item) => {
        return `<path id=${this.containerName}-season-${item} class=${this.containerName}-season fill='${SeasonColor[item]}' />`;
      })
      .join("")}
    ${this.originalData
      .map((item, i) => {
        return `<path id=${this.containerName}-month-${item.month} class=${this.containerName}-month fill='${
          MonthColor[item.month]
        }' />
        <text text-anchor="middle" id=${this.containerName}-month-${item.month}-text class=${
          this.containerName
        }-month-text x=250 y=250 fill='#fff'>${item.month}월</text>`;
      })
      .join("")}
    ${["income", "outlay"]
      .map((item) => {
        return `<path id=${this.containerName}-${item} class=${this.containerName}-type fill='${
          TypeColor[item.toUpperCase()]
        }' />
        <text text-anchor="middle" id=${this.containerName}-text class=${
          this.containerName
        }-type-text x=250 y=250 fill='#fff'>${item === "income" ? "수입" : "지출"}</text>`;
      })
      .join("")}
      ${Object.keys(incomeData)
        .map((item) => {
          return `<path id=${this.containerName}-${item} class=${this.containerName}-income fill='${
            TypeColor[`INCOME`]
          }' />
          <text text-anchor="middle" id=${this.containerName}-${item} class=${
            this.containerName
          }-income-text x=250 y=250 fill='#fff'>${item}</text>`;
        })
        .join("")}
        ${Object.keys(outlayData)
          .map((item) => {
            return `<path id=${this.containerName}-${item} class=${this.containerName}-outlay fill='${
              TypeColor[`OUTLAY`]
            }' />
            <text text-anchor="middle" id=${this.containerName}-${item} class=${
              this.containerName
            }-outlay-text x=250 y=250 fill='#fff'>${item}</text>`;
          })
          .join("")}
      </svg>
      `;
  }
  initStyle() {
    const container = <HTMLElement>document.querySelector(`#${this.containerName}`);
    const text = <HTMLElement>document.querySelector(`#${this.containerName}-text`);
    $style(container, {
      position: "relative",
    });
    $style(text, {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      position: "absolute",
      top: `50%`,
      left: `50%`,
      transform: `translate(-50%,-50%)`,
    });
  }
  drawChart() {
    const container = <HTMLElement>document.querySelector(`#${this.containerName}`);
    const svg = container.querySelector("svg");
    const zoomSize = Number(container.style.width.split("px")[0]) / SVG_WIDTH;
    svg.style.zoom = String(zoomSize);

    let i;

    /**
     * Draw Season
     */
    const seasonElem = svg.querySelectorAll(`.${this.containerName}-season`);
    i = -90;
    [].slice.call(seasonElem).forEach((item: HTMLElement) => {
      item.setAttribute("d", toPieChartItemPath(250, 250, 70, 79, i, i + 360 / seasonElem.length - 0.5));
      i += 360 / seasonElem.length;
    });

    /**
     * Draw Month
     */
    const monthElems = svg.querySelectorAll(`.${this.containerName}-month`);

    i = (360 / monthElems.length) * 7;
    [].slice.call(monthElems).forEach((item: HTMLElement) => {
      item.setAttribute("d", toPieChartItemPath(250, 250, 80, 110, i, i + 360 / monthElems.length - 0.5));
      i += 360 / monthElems.length;
    });

    /**
     * Draw Month Text
     */
    const monthTextElems = svg.querySelectorAll(`.${this.containerName}-month-text`);

    i = (360 / monthElems.length) * 7;
    [].slice.call(monthTextElems).forEach((item: HTMLElement, index) => {
      item.style.cssText = `user-select:none; font-size:12px; transform-origin:250px 340px; transform:translate(0px,-90px) rotate(${
        i + 105
      }deg);`;
      i += 360 / monthElems.length;
    });

    /**
     * Draw Type [income, outlay]
     */
    const types = svg.querySelectorAll(`.${this.containerName}-type`);
    i = 90;
    [].slice.call(types).forEach((item: HTMLElement, index) => {
      item.setAttribute("d", toPieChartItemPath(250, 250, 141, 171, i, i + 180 - 0.5));
      i += 180;
    });

    /**
     * Draw Type Text [income, outlay]
     */
    const typeTexts = svg.querySelectorAll(`.${this.containerName}-type-text`);
    i = -90;
    [].slice.call(typeTexts).forEach((item: HTMLElement, index) => {
      item.style.cssText = `user-select:none; font-size:12px; transform-origin:250px 400px; transform:translate(0px,-150px) rotate(${i}deg);`;
      i += 180;
    });

    /**
     * Draw Income Data [월급, 용돈 ...]
     */
    const incomes = svg.querySelectorAll(`.${this.containerName}-income`);
    const incomeDatas: number[] = Object.values(incomeData);
    const incomeSum: number = incomeDatas.reduce((acc: number, cur: number) => acc + cur, 0);
    i = 90;
    [].slice.call(incomes).forEach((item: HTMLElement, index) => {
      let itemI = i;
      let myIndex = itemI + 180 * (incomeDatas[index] / incomeSum) - 0.5;
      item.setAttribute(
        "d",
        toPieChartItemPath(250, 250, 172, 202, i, i + 180 * (incomeDatas[index] / incomeSum) - 0.5),
      );
      item.addEventListener("mouseenter", (e) => {
        item.setAttribute("d", toPieChartItemPath(250, 250, 172, 232, itemI, myIndex));
        [].slice.call(incomes).forEach((item: HTMLElement) => {
          item.style.opacity = "0.3";
        });
        [].slice.call(outlays).forEach((item: HTMLElement) => {
          item.style.opacity = "0.3";
        });
        (<HTMLElement>e.currentTarget).style.opacity = "1";
        (<HTMLElement>types[0]).style.opacity = "1";
        (<HTMLElement>types[1]).style.opacity = "0.3";
        
        selectedData[`dataType`] = (<HTMLElement>e.currentTarget).id.split(`-`)[(<HTMLElement>e.currentTarget).id.split(`-`).length-1];
        selectedData[`type`] = "income";
        this.drawCenterText();
      });
      item.addEventListener("mouseleave", () => {
        item.setAttribute("d", toPieChartItemPath(250, 250, 172, 202, itemI, myIndex));
      });
      i += 180 * (incomeDatas[index] / incomeSum);
    });

    /**
     * Draw Income Data Text
     */
    const IncomeTexts = svg.querySelectorAll(`.${this.containerName}-income-text`);
    i = 180;
    [].slice.call(IncomeTexts).forEach((item: HTMLElement, index) => {
      item.style.cssText = `font-size:12px; transform-origin:250px 430px; transform:translate(0px,-180px) rotate(${
        i + (180 * (incomeDatas[index] / incomeSum)) / 2
      }deg); user-select:none; pointer-events:none;`;
      i += 180 * (incomeDatas[index] / incomeSum);
    });

    /**
     * Draw Outlay Data [교통, 쇼핑/뷰티 ...]
     */
    i = 270;
    const outlays = svg.querySelectorAll(`.${this.containerName}-outlay`);
    const outlayDatas: number[] = Object.values(outlayData);
    const outlaySum: number = outlayDatas.reduce((acc: number, cur: number) => acc + cur, 0);
    [].slice.call(outlays).forEach((item: HTMLElement, index) => {
      let itemI = i;
      let myIndex = itemI + 180 * (outlayDatas[index] / outlaySum) - 0.5;
      item.setAttribute(
        "d",
        toPieChartItemPath(250, 250, 172, 202, i, i + 180 * (outlayDatas[index] / outlaySum) - 0.5),
      );
      item.addEventListener("mouseenter", (e) => {
        item.setAttribute("d", toPieChartItemPath(250, 250, 172, 222, itemI, myIndex));
        [].slice.call(outlays).forEach((item: HTMLElement) => {
          item.style.opacity = "0.3";
        });
        [].slice.call(incomes).forEach((item: HTMLElement) => {
          item.style.opacity = "0.3";
        });
        (<HTMLElement>e.currentTarget).style.opacity = "1";
        (<HTMLElement>types[0]).style.opacity = "0.3";
        (<HTMLElement>types[1]).style.opacity = "1";
        selectedData[`dataType`] = (<HTMLElement>e.currentTarget).id.split(`-`)[(<HTMLElement>e.currentTarget).id.split(`-`).length-1];
        selectedData[`type`] = "outlay";
        this.drawCenterText();
      });
      item.addEventListener("mouseleave", () => {
        item.setAttribute("d", toPieChartItemPath(250, 250, 172, 202, itemI, myIndex));
      });
      i += 180 * (outlayDatas[index] / outlaySum);
    });

    /**
     * Draw Outlay Data Text
     */
    const outlayTexts = svg.querySelectorAll(`.${this.containerName}-outlay-text`);
    i = 0;
    [].slice.call(outlayTexts).forEach((item: HTMLElement, index) => {
      item.style.cssText = `font-size:12px; transform-origin:250px 430px; transform:translate(0px,-180px) rotate(${
        i + (180 * (outlayDatas[index] / outlaySum)) / 2
      }deg); user-select:none; pointer-events:none;`;
      i += 180 * (outlayDatas[index] / outlaySum);
    });
  }

  drawCenterText() {
    const text = <HTMLElement>document.querySelector(`#${this.containerName}-text`);
    let defaltText = `<div>${this.chartTitle}</div>`;
    let insertText = "";
    insertText += selectedData[`season`]
      ? `<div id=${this.containerName}-text-season style='font-size:6px'>${selectedData[`season`]}</div>`
      : "";
    insertText += selectedData[`month`]
      ? `<div id=${this.containerName}-text-month style='font-size:9px; font-weight:bold'>${
          selectedData[`month`]
        }월</div>`
      : "";

    const container = <HTMLElement>document.querySelector(`#${this.containerName}`);
    const svg = container.querySelector("svg");
    let ratio;

    const incomes = svg.querySelectorAll(`.${this.containerName}-income`);
    const incomeDatas: number[] = Object.values(incomeData);
    const incomeSum: number = incomeDatas.reduce((acc: number, cur: number) => acc + cur, 0);

    const outlays = svg.querySelectorAll(`.${this.containerName}-outlay`);
    const outlayDatas: number[] = Object.values(outlayData);
    const outlaySum: number = outlayDatas.reduce((acc: number, cur: number) => acc + cur, 0);

    [].slice.call(incomes).forEach((item: HTMLElement, index) => {

      if (selectedData[`dataType`] === item.id.split(`-`)[item.id.split(`-`).length-1]) {
        ratio = incomeDatas[index] / incomeSum;
      }
    });

    [].slice.call(outlays).forEach((item: HTMLElement, index) => {

      if (selectedData[`dataType`] === item.id.split(`-`)[item.id.split(`-`).length-1]) {
        ratio = outlayDatas[index] / outlaySum;
      }
    });    

    insertText += selectedData[`dataType`]
      ? `<div style='font-size:32px; font-weight:bold'>${Math.round(ratio * 100)}%</div>`
      : "";

    insertText += selectedData[`type`]
      ? `<div id=${this.containerName}-text-type style='font-size:6px'>${
          selectedData[`type`] === "income" ? "수입" : "지출"
        }</div>`
      : "";
    insertText += selectedData[`dataType`]
      ? `<div id=${this.containerName}-text-type style='font-size:12px; font-weight:bold;'>${
          selectedData[`dataType`]
        }</div>`
      : "";
    text.innerHTML = insertText ? insertText : defaltText;
  }

  addEventListener() {
    const container = <HTMLElement>document.querySelector(`#${this.containerName}`);
    const svg = container.querySelector("svg");
    const resetCircle = svg.querySelector("circle");
    const seasonElems = svg.querySelectorAll(`.${this.containerName}-season`);
    const monthElems = svg.querySelectorAll(`.${this.containerName}-month`);
    const types = svg.querySelectorAll(`.${this.containerName}-type`);

    resetCircle.addEventListener("mouseenter", () => {
      const allElems = [...[].slice.call(seasonElems), ...[].slice.call(monthElems)];
      allElems.forEach((item) => {
        item.style.opacity = "1";
      });
      this.drawCenterText();
    });

    resetCircle.addEventListener("click", () => {
      selectedData[`dataType`] = undefined;
      selectedData[`type`] = undefined;
      selectedData[`month`] = undefined;
      selectedData[`season`] = undefined;
      this.drawCenterText();
      this.initProps(this.chartProps);
      this.drawChart();
      const incomes = svg.querySelectorAll(`.${this.containerName}-income`);
      const outlays = svg.querySelectorAll(`.${this.containerName}-outlay`);
      const allElems = [...[].slice.call(types), ...[].slice.call(incomes), ...[].slice.call(outlays)];
      allElems.forEach((item) => {
        item.style.opacity = "1";
      });
    });

    [].slice.call(seasonElems).forEach((seasonElem: HTMLElement) => {
      seasonElem.addEventListener("mouseenter", (e) => {
        [].slice.call(seasonElems).forEach((seasonElem: HTMLElement) => {
          seasonElem.style.opacity = "0.3";
        });
        const season = (<HTMLElement>e.currentTarget).id.split("-")[(<HTMLElement>e.currentTarget).id.split("-").length-1];
        selectedData[`season`] = season;
        (<HTMLElement>e.currentTarget).style.opacity = "1";
        this.drawCenterText();
      });
    });

    [].slice.call(monthElems).forEach((monthElem: HTMLElement) => {
      monthElem.addEventListener("mouseenter", (e) => {
        const month = Number((<HTMLElement>e.currentTarget).id.split("-")[(<HTMLElement>e.currentTarget).id.split("-").length-1]);
        this.changeData(month);
        this.drawChart();

        [].slice.call(monthElems).forEach((monthElem: HTMLElement) => {
          monthElem.style.opacity = "0.3";
        });

        selectedData[`month`] = month;
        [].slice.call(seasonElems).forEach((seasonElem: HTMLElement, index) => {
          seasonElem.style.opacity = "0.3";
          if ([3, 4, 5].indexOf(month) >= 0 && index === 0) {
            selectedData[`season`] = "SPRING";
            seasonElem.style.opacity = "1";
          }
          if ([6, 7, 8].indexOf(month) >= 0 && index === 1) {
            selectedData[`season`] = "SUMMER";
            seasonElem.style.opacity = "1";
          }
          if ([9, 10, 11].indexOf(month) >= 0 && index === 2) {
            selectedData[`season`] = "FALL";
            seasonElem.style.opacity = "1";
          }
          if ([12, 1, 2].indexOf(month) >= 0 && index === 3) {
            selectedData[`season`] = "WINTER";
            seasonElem.style.opacity = "1";
          }
        });
        (<HTMLElement>e.currentTarget).style.opacity = "1";
        this.drawCenterText();
      });
    });

    [].slice.call(types).forEach((typeElem: HTMLElement, index) => {
      typeElem.addEventListener("mouseenter", (e) => {
        const incomes = svg.querySelectorAll(`.${this.containerName}-income`);
        const outlays = svg.querySelectorAll(`.${this.containerName}-outlay`);
        [].slice.call(types).forEach((typeElem: HTMLElement) => {
          typeElem.style.opacity = "0.3";
        });
        index === 0 &&
          [].slice.call(outlays).forEach((item: HTMLElement) => {
            item.style.opacity = "0.3";
          });
        index === 1 &&
          [].slice.call(incomes).forEach((item: HTMLElement) => {
            item.style.opacity = "0.3";
          });
        const type = (<HTMLElement>e.currentTarget).id.split("-")[ (<HTMLElement>e.currentTarget).id.split("-").length-1];
        selectedData[`type`] = type;
        (<HTMLElement>e.currentTarget).style.opacity = "1";
        this.drawCenterText();
      });
    });
  }
}
