import Chart from "./Chart";
import { ChartProps } from "./types";
const dummy = require("./data/data.json");

const chartProps: ChartProps = {
  selector: "root",
  data: dummy,
};

new Chart(chartProps);
