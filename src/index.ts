import Chart from "./Chart";
import { ChartProps } from "./types";
const dummy = require("./data/data.json");

const chartProps: ChartProps = {
  selector: "root",
  chartTitle: "Accountbook line Chart",
  data: dummy,
};

// new Chart({ selector: "root", chartTitle: "d", data: dummy });

export { Chart };
