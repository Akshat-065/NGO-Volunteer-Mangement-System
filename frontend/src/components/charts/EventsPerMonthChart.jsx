import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { classNames } from "../../utils/formatters";

const normalizeMonthlyData = (items = []) =>
  items.map((item) => ({
    label: item.label || item.month || item.name || "",
    value: Number(item.value ?? item.count ?? item.events ?? 0)
  }));

const EventsPerMonthChart = ({
  data = [],
  title = "Events per Month",
  subtitle = "Monthly event volume",
  className = ""
}) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const series = normalizeMonthlyData(data);
  const totalEvents = series.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    if (!canvasRef.current) {
      return undefined;
    }

    const normalizedSeries = normalizeMonthlyData(data);

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    if (!normalizedSeries.length) {
      return undefined;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: normalizedSeries.map((item) => item.label),
        datasets: [
          {
            label: title,
            data: normalizedSeries.map((item) => item.value),
            backgroundColor: "#0D5C63",
            hoverBackgroundColor: "#2FA3A0",
            borderRadius: 10,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "#0F172A",
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.y} events`
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: "#64748B",
              font: {
                size: 12
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "#E6EEF1"
            },
            ticks: {
              color: "#64748B",
              precision: 0
            }
          }
        }
      }
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, title]);

  return (
    <div
      className={classNames(
        "rounded-3xl border border-mist/70 bg-white/90 p-6 shadow-card",
        className
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate/70">{subtitle}</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">{title}</h2>
        </div>
        <div className="rounded-2xl bg-tide/10 px-3 py-2 text-sm font-semibold text-lagoon">
          {totalEvents} total
        </div>
      </div>

      <div className="h-[280px]">
        {series.length ? (
          <canvas ref={canvasRef} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate">
            No monthly event data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPerMonthChart;
