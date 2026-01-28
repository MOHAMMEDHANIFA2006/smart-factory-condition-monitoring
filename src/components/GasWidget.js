import React, { useEffect, useRef, useState } from "react";
import { getFeedData } from "../AdafruitAPI";

const GasWidget = ({ variant = "both" }) => {
  const [gasLevel, setGasLevel] = useState("Loading...");
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const dataRef = useRef([]);

  useEffect(() => {
    let mounted = true;

    const pushValue = (value) => {
      const ts = new Date().toLocaleTimeString();
      dataRef.current.push({ t: ts, v: value });
      if (dataRef.current.length > 20) dataRef.current.shift();
    };

    const fetchAndUpdate = async () => {
      const value = await getFeedData("gas");
      const numeric = value ? Number(value) : null;
      if (mounted) {
        setGasLevel(numeric != null ? `${numeric} ppm` : "No Data");
        const point = numeric != null ? numeric : (dataRef.current.slice(-1)[0]?.v ?? 0);
        pushValue(point);
      }
    };

    for (let i = 0; i < 5; i++) dataRef.current.push({ t: "", v: 0 });

    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 7000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (variant === "metric") return;
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
            label: "Gas (ppm)",
            data: dataRef.current.map((d) => d.v),
            borderColor: "#9966ff",
            backgroundColor: "rgba(153,102,255,0.12)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: { responsive: true, animation: false, scales: { x: { display: false } }, plugins: { legend: { display: false } } },
    });

    return () => chartRef.current && chartRef.current.destroy();
  }, [variant]);

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

  if (variant === "metric") {
    return (
      <div className="widget gas metric-card">
        <h2>Gas</h2>
        <p className="value">{gasLevel}</p>
        <p className="small">Range: typical ppm · Gas concentration</p>
      </div>
    );
  }

  return (
    <div className="widget gas">
      <h2>Gas</h2>
      <p className="value">{gasLevel}</p>
      <div className="chart-area">
        <canvas ref={canvasRef} />
      </div>
      {variant !== "chart" ? <p className="small">Range: typical ppm · Gas concentration</p> : null}
    </div>
  );
};

export default GasWidget;
