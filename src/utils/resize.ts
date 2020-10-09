export const trueLengthToCanvasLength = (trueLength, canvasSize, trueSize) => {
  return (trueLength * canvasSize) / trueSize;
};

export const canvasLengthToTrueLength = (canvasLength, canvasSize, trueSize) => {
  return (canvasLength / canvasSize) * trueSize;
};

export const chartLengthToMinimapLength = (chartLength, chartSize, minimapSize, visibleRatio) => {
  return chartLength * (minimapSize / chartSize) * visibleRatio;
};

export const minimapLengthToChartLength = (minimapLength, chartSize, minimapSize, visibleRatio) => {
  return ((minimapLength / minimapSize) * chartSize) / visibleRatio;
};
