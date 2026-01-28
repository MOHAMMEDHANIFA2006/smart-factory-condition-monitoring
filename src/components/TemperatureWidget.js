import React, { useEffect, useRef, useState } from "react";
import { getFeedData } from "../AdafruitAPI";

const TemperatureWidget = ({ variant = "both" }) => {
  const [temperature, setTemperature] = useState("Loading...");
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const dataRef = useRef([]); // stores last N points

  // fetch latest value and maintain a small rolling history
  useEffect(() => {
    let mounted = true;

    const pushValue = (value) => {
      const ts = new Date().toLocaleTimeString();
      dataRef.current.push({ t: ts, v: value });
      if (dataRef.current.length > 20) dataRef.current.shift();
    };

    const fetchAndUpdate = async () => {
      const value = await getFeedData("temperature");
      const numeric = value ? Number(value) : null;
      if (mounted) {
        setTemperature(numeric != null ? `${numeric} °C` : "No Data");
        const point = numeric != null ? numeric : (dataRef.current.slice(-1)[0]?.v ?? 0);
        pushValue(point);
      }
    };

    // initial fill (simulate a few points if no data available yet)
    for (let i = 0; i < 5; i++) dataRef.current.push({ t: "", v: 0 });

    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // initialize Chart.js chart (only when showing chart)
  useEffect(() => {
    if (variant === "metric") return; // no chart for metric-only variant
    const ctx = canvasRef.current && canvasRef.current.getContext("2d");
    if (!ctx) return;
    const ChartCtor = window.Chart;
    if (!ChartCtor) return;

    chartRef.current = new ChartCtor(ctx, {
      type: "line",
      data: {
        labels: dataRef.current.map((d) => d.t),
        datasets: [
          {
            label: "Temperature (°C)",
            data: dataRef.current.map((d) => d.v),
            borderColor: "#ff6384",
            backgroundColor: "rgba(255,99,132,0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        scales: { x: { display: false } },
        plugins: { legend: { display: false } },
      },
    });

    return () => chartRef.current && chartRef.current.destroy();
  }, [variant]);

  // update chart when new data arrives (polling pushes into dataRef)
  useEffect(() => {
    const interval = setInterval(() => {
      const chart = chartRef.current;
      if (!chart) return;
      chart.data.labels = dataRef.current.map((d) => d.t);
      chart.data.datasets[0].data = dataRef.current.map((d) => d.v);
      chart.update();
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Render differently depending on requested variant
  if (variant === "metric") {
    return (
      <div className="widget temperature metric-card">
        <h2>Temperature</h2>
        <p className="value">{temperature}</p>
        <p className="small">Range: 18 - 32 °C · Indoor ambient</p>
      </div>
    );
  }

  // chart or both
  return (
    <div className={"widget temperature"}>
      <h2>Temperature</h2>
      <p className="value">{temperature}</p>
      <div className="chart-area">
        <canvas ref={canvasRef} />
      </div>
      {variant !== "chart" ? <p className="small">Range: 18 - 32 °C · Indoor ambient</p> : null}
    </div>
  );
};

export default TemperatureWidget;
