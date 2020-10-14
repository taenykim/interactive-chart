export const toPieChartItemPath = (
  x: number,
  y: number,
  radiusIn: number,
  radiusOut: number,
  startAngle: number,
  endAngle: number,
) => {
  const _toXY = (cX: number, cY: number, r: number, degrees: number) => {
    const rad = (degrees * Math.PI) / 180.0;
    return {
      x: isNaN(cX + r * Math.cos(rad)) ? 0 : cX + r * Math.cos(rad),
      y: isNaN(cY + r * Math.sin(rad)) ? 0 : cY + r * Math.sin(rad),
    };
  };
  const startIn = _toXY(x, y, radiusIn, endAngle);
  const endIn = _toXY(x, y, radiusIn, startAngle);
  const startOut = _toXY(x, y, radiusOut, endAngle);
  const endOut = _toXY(x, y, radiusOut, startAngle);
  const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  return [
        "M", startIn.x, startIn.y,
        "L", startOut.x, startOut.y,
        "A", radiusOut, radiusOut, 0, arcSweep, 0, endOut.x, endOut.y,
        "L", endIn.x, endIn.y,
        "A", radiusIn, radiusIn, 0, arcSweep, 1, startIn.x, startIn.y,
        "z"
    ].join(" "); //prettier-ignore
};
