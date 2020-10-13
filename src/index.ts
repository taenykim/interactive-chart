import Line from "./Line";
import Pie from "./Pie";
import { ChartProps } from "./types";
const dummy = require("./data/data.json");

const chartProps: ChartProps = {
  selector: "root",
  chartTitle: "Accountbook line Chart",
  data: dummy,
};

// new Chart(chartProps);
// new Pie(chartProps);

export { Line, Pie };
