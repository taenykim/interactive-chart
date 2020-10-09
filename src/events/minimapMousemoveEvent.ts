import Chart from "../Chart";

export const minimapMousemoveEvent = (
  e: MouseEvent,
  _this: Chart,
  minimapContainer: HTMLElement,
  mousedownFlag: null | number,
  minimapPositions: any,
) => {
  minimapContainer.style.cursor = "default";
  if (e.offsetX > minimapPositions[0] - 3 && e.offsetX < minimapPositions[0] + 3) {
    minimapContainer.style.cursor = "ew-resize";
  }
  if (e.offsetX > minimapPositions[1] - 3 && e.offsetX < minimapPositions[1] + 3) {
    minimapContainer.style.cursor = "ew-resize";
  }
  if (e.offsetX > minimapPositions[0] + 3 && e.offsetX < minimapPositions[1] - 3) {
    minimapContainer.style.cursor = "grab";
    if (mousedownFlag) {
      _this.tempVisibleMoveX = mousedownFlag - e.offsetX;
      _this.drawChart(_this.moveX, _this.visibleMoveX + _this.tempVisibleMoveX);
      _this.drawMinimap(_this.moveX, _this.visibleMoveX + _this.tempVisibleMoveX);
    }
  }
};
