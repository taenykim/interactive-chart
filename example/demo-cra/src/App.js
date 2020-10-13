import React, { useEffect } from "react";
import { Line, Pie } from "interactive-chart";
import data from "./data.json";
import styled from "styled-components";

const LineComp = styled.div`
  width: 600px;
  border: 2px solid black;
  background-color: #fff;
  padding: 12px;
  margin: 10px;
`;

const PieComp = styled.div`
  width: 600px;
  height: 600px;
  border: 2px solid black;
  background-color: #fff;
  padding: 12px;
`;

const App = () => {
  useEffect(() => {
    new Line({ selector: "line-chart", chartTitle: "Accountbook Line Chart", data });
    new Pie({ selector: "pie-chart", chartTitle: "Pie Chart", data, offsetMonth: 11 });
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <LineComp id="line-chart"></LineComp>
      <div style={{ width: "600px", border: `2px solid black`, margin: "10px", padding: `12px` }} id="pie-chart"></div>
    </div>
  );
};

export default App;
