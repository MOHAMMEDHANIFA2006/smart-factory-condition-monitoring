import React from "react";
import TemperatureWidget from "./components/TemperatureWidget";
import HumidityWidget from "./components/HumidityWidget";
import GasWidget from "./components/GasWidget";
import MotionWidget from "./components/MotionWidget";

import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>Smart Factory Condition Monitoring Dashboard</h1>

      {/* Top row: metric summary cards */}
      <div className="metrics-row">
        <TemperatureWidget variant="metric" />
        <HumidityWidget variant="metric" />
        <GasWidget variant="metric" />
        <MotionWidget variant="metric" />
      </div>

      {/* Bottom row: compact charts */}
      <div className="charts-row">
        <TemperatureWidget variant="chart" />
        <HumidityWidget variant="chart" />
        <GasWidget variant="chart" />
        <MotionWidget variant="chart" />
      </div>
    </div>
  );
}

export default App;
