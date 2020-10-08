export const minimapMousemoveEvent = (e, _this, minimapContainer, mousedownFlag, minimapPositions) => {
  minimapContainer.style.cursor = "default";
  if (mousedownFlag) {
    _this.tempLimitRatioX = mousedownFlag - e.offsetX;
    _this.drawChart(_this.moveX, _this.limitRatioX + _this.tempLimitRatioX);
    _this.drawMinimap(_this.moveX);
  }
  if (e.offsetX > minimapPositions[0] - 3 && e.offsetX < minimapPositions[0] + 3) {
    minimapContainer.style.cursor = "ew-resize";
  }
  if (e.offsetX > minimapPositions[1] - 3 && e.offsetX < minimapPositions[1] + 3) {
    minimapContainer.style.cursor = "ew-resize";
  }
  if (e.offsetX > minimapPositions[0] + 3 && e.offsetX < minimapPositions[1] - 3) {
    minimapContainer.style.cursor = "grab";
  }
};
