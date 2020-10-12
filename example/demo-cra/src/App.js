import React, { useEffect } from "react";
import { Chart } from "interactive-chart";
import data from "./data.json";
import styled from "styled-components";

const ChartComp = styled.div`
  width: 900px;
  border: 2px solid black;
  background-color: #fff;
  padding: 12px;
`;

const App = () => {
  useEffect(() => {
    new Chart({ selector: "line-chart", chartTitle: "Accountbook Line Chart", data });
  }, []);
  return <ChartComp id="line-chart"></ChartComp>;
};

export default App;
