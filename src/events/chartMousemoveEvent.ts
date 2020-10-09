import Chart from "../Chart";

export const chartMousemoveEvent = (
  e: MouseEvent,
  _this: Chart,
  mousedownFlag: null | number,
  dataPositions: any,
  dataContents: any,
) => {
  if (e.target !== _this.elements.chart) return;
  if (mousedownFlag) {
    _this.tempMoveX = mousedownFlag - e.offsetX;
    const chartVerticalTooltip = _this.elements.chartVerticalTooltip;
    const chartHorizontalTooltip = _this.elements.chartHorizontalTooltip;
    chartVerticalTooltip.style.left = `${e.offsetX}px`;
    chartHorizontalTooltip.style.top = `${e.offsetY}px`;
    _this.drawChart(_this.moveX + _this.tempMoveX, _this.visibleMoveX);
    _this.drawMinimap(_this.moveX + _this.tempMoveX, _this.visibleMoveX);
  } else {
    const chartVerticalTooltip = _this.elements.chartVerticalTooltip;
    const chartHorizontalTooltip = _this.elements.chartHorizontalTooltip;
    chartVerticalTooltip.style.display = `block`;
    chartHorizontalTooltip.style.display = `block`;
    chartHorizontalTooltip.style.top = `${e.offsetY}px`;
    _this.drawChart(_this.moveX, _this.visibleMoveX);
    _this.drawMinimap(_this.moveX, _this.visibleMoveX);
  }

  const chartInformation = _this.elements.chartInformation;
  const chartHorizontalValue = _this.elements.chartHorizontalValue;
  chartInformation.style.left = `${e.offsetX + 20}px`;
  chartInformation.style.top = `${e.offsetY + 20}px`;
  chartHorizontalValue.style.display = "block";
  chartHorizontalValue.style.left = `0px`;
  chartHorizontalValue.style.top = `${e.offsetY}px`;
  chartHorizontalValue.innerHTML = `${e.offsetY}`;

  const chartVerticalTooltip = _this.elements.chartVerticalTooltip;
  dataPositions.forEach((item, i) => {
    if (e.offsetX > item[0] - 6 && e.offsetX < item[0] + 6) {
      const chartInformationHTML =
        dataContents[i].reduce((acc, cur) => {
          return acc + `<div>${cur.type} : ${cur.amount}</div>`;
        }, "") +
        `<div style="font-weight:bold; margin-top:6px">총 금액 : ${dataContents[i].reduce((acc, cur) => {
          return acc + cur.amount;
        }, 0)}</div>`;
      chartInformation.style.display = "block";
      chartVerticalTooltip.style.left = `${item[0]}px`;
      chartInformation.innerHTML = chartInformationHTML;
    }
  });
};
