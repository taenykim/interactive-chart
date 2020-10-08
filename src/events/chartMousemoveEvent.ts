export const chartMousemoveEvent = (e, _this, mousedownFlag, dataPositions, dataContents) => {
  if (e.target !== _this.elements.chart) return;
  const trueCHART_WIDTH = _this.elements.chart.getBoundingClientRect().width;
  const trueCHART_HEIGHT = _this.elements.chart.getBoundingClientRect().height;
  const CANVAS_WIDTH = _this.elements.chart.width;
  const CANVAS_HEIGHT = _this.elements.chart.height;
  if (mousedownFlag) {
    _this.tempMoveX = mousedownFlag - e.offsetX;
    const chartVerticalTooltip = _this.elements.chartVerticalTooltip;
    chartVerticalTooltip.style.left = `${e.offsetX}px`;
    const chartHorizontalTooltip = _this.elements.chartHorizontalTooltip;
    chartHorizontalTooltip.style.top = `${e.offsetY}px`;
    _this.drawChart(_this.moveX + _this.tempMoveX, _this.limitRatioX);
    _this.drawMinimap(_this.moveX + _this.tempMoveX);
  } else {
    const chartVerticalTooltip = _this.elements.chartVerticalTooltip;
    chartVerticalTooltip.style.display = `block`;
    const chartHorizontalTooltip = _this.elements.chartHorizontalTooltip;
    chartHorizontalTooltip.style.display = `block`;
    chartHorizontalTooltip.style.top = `${e.offsetY}px`;
    _this.drawChart(_this.moveX, _this.limitRatioX);
    _this.drawMinimap(_this.moveX);
  }

  const chartInformation = _this.elements.chartInformation;
  const chartHorizontalValue = _this.elements.chartHorizontalValue;
  chartHorizontalValue.style.display = "block";
  chartHorizontalValue.style.left = `0px`;
  chartHorizontalValue.style.top = `${e.offsetY}px`;
  chartHorizontalValue.innerHTML = `${e.offsetY}`;
  chartInformation.style.left = `${e.offsetX + 20}px`;
  chartInformation.style.top = `${e.offsetY + 20}px`;
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
