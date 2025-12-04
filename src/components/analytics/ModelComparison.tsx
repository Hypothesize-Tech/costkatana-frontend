import { Bar } from "react-chartjs-2";
import { formatCurrency } from "@/utils/formatters";
import {
  getBarChartOptions,
} from "@/utils/chartConfig";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface ModelComparisonProps {
  data: Array<{
    model: string;
    cost: number;
    calls: number;
    avgTokens: number;
    avgCost: number;
  }>;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({ data }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Sort data by cost descending and take top 10
  const sortedData = [...data]
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  const labels = sortedData.map((item) =>
    item.model.length > 15
      ? item.model.substring(0, 15) + "..."
      : item.model
  );

  // Create chart data with gradient
  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Cost",
        data: sortedData.map((d) => d.cost),
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
          const chart = context.chart;
          if (!chart.chartArea) {
            return "#06ec9e";
          }
          const ctx = chart.ctx;
          const gradient = ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);
          gradient.addColorStop(0, "#009454");
          gradient.addColorStop(1, "#06ec9e");
          return gradient;
        },
        borderColor: "#06ec9e",
        borderWidth: 0,
      },
    ],
  };

  // Create a map for quick lookup of model data
  const modelDataMap = new Map(
    sortedData.map((item) => [item.model, item])
  );

  const options = getBarChartOptions({
    plugins: {
      ...getBarChartOptions().plugins,
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark
          ? "rgba(30, 41, 59, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        titleColor: isDark ? "rgb(241, 245, 249)" : "rgb(15, 23, 42)",
        bodyColor: isDark ? "rgb(203, 213, 225)" : "rgb(71, 85, 105)",
        borderColor: "rgba(6, 236, 158, 0.2)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        displayColors: true,
        callbacks: {
          title: (tooltipItems: Array<{ label?: string }>) => {
            return tooltipItems[0]?.label || "";
          },
          label: (tooltipItem: { label?: string; parsed: { y: number } }) => {
            const modelName = tooltipItem.label || "";
            // Find the full model name (not truncated)
            const fullModelName = sortedData.find((item) =>
              item.model.startsWith(modelName.replace("...", ""))
            )?.model || modelName;

            const modelData = modelDataMap.get(fullModelName);
            if (!modelData) return "";

            return [
              `Total Cost: ${formatCurrency(tooltipItem.parsed.y)}`,
              `Total Calls: ${modelData.calls.toLocaleString()}`,
              `Avg Cost/Call: ${formatCurrency(modelData.avgCost)}`,
              `Avg Tokens: ${(modelData.avgTokens || 0).toLocaleString()}`,
            ];
          },
        },
      },
    },
    scales: {
      ...getBarChartOptions().scales,
      x: {
        ...getBarChartOptions().scales?.x,
        ticks: {
          ...getBarChartOptions().scales?.x?.ticks,
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        ...getBarChartOptions().scales?.y,
        grid: {
          color: isDark
            ? "rgba(6, 236, 158, 0.1)"
            : "rgba(6, 236, 158, 0.1)",
        },
        ticks: {
          ...getBarChartOptions().scales?.y?.ticks,
          callback: (value: number | string) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            if (numValue > 1000) {
              return `$${(numValue / 1000).toFixed(1)}k`;
            }
            return formatCurrency(numValue);
          },
        },
      },
    },
    elements: {
      ...getBarChartOptions().elements,
      bar: {
        borderRadius: 12,
        borderWidth: 0,
      },
    },
  });

  return (
    <div className="group p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.01] hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold font-display gradient-text-primary">
          Model Comparison
        </h3>
      </div>
      <div className="h-96 chart-container rounded-xl">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
