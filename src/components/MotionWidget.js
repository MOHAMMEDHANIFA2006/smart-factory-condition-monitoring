import React, { useEffect, useRef, useState } from "react";
import { getFeedData } from "../AdafruitAPI";

const MotionWidget = ({ variant = "both" }) => {
  const [motion, setMotion] = useState("Loading...");
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
      const value = await getFeedData("motion");
      const numeric = value != null ? Number(value) : null;
      if (mounted) {
        setMotion(numeric === 1 ? "Detected" : "No Motion");
        const point = numeric != null ? numeric : (dataRef.current.slice(-1)[0]?.v ?? 0);
        pushValue(point);
      }
    };

    for (let i = 0; i < 5; i++) dataRef.current.push({ t: "", v: 0 });

    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 5000);

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
            label: "Motion (1 = detected)",
            data: dataRef.current.map((d) => d.v),
            borderColor: "#ffce56",
            backgroundColor: "rgba(255,206,86,0.12)",
            fill: true,
            tension: 0.1,
            stepped: true,
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
      <div className="widget motion metric-card">
        <h2>Motion</h2>
        <p className="value">{motion === "Detected" ? "Detected" : "No Motion"}</p>
        <p className="small">Real-time motion status (0 = no motion, 1 = detected)</p>
      </div>
    );
  }

  return (
    <div className="widget motion">
      <h2>Motion</h2>
      <p className="value" style={{ color: motion === "Detected" ? "red" : "green" }}>
        {motion}
      </p>
      <div className="chart-area">
        <canvas ref={canvasRef} />
      </div>
      {variant !== "chart" ? <p className="small">Real-time motion data</p> : null}
    </div>
  );
};

export default MotionWidget;
