import { Line } from "react-chartjs-2";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  getLineChartOptions,
} from "@/utils/chartConfig";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface CostTrendChartProps {
  data: Array<{
    date: string;
    cost: number;
    calls: number;
  }>;
}

export const CostTrendChart: React.FC<CostTrendChartProps> = ({ data }) => {
  const labels = data.map((d) => formatDate(d.date, "MMM d"));
  const costData = data.map((d) => d.cost);
  const callsData = data.map((d) => d.calls);

  // Calculate max values for better scaling
  const maxCost = Math.max(...costData, 0);
  const maxCalls = Math.max(...callsData, 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cost ($)",
        data: costData,
        borderColor: "#06ec9e",
        backgroundColor: "rgba(6, 236, 158, 0.1)",
        fill: true,
        yAxisID: "y",
        tension: 0.4,
      },
      {
        label: "API Calls",
        data: callsData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        yAxisID: "y1",
        tension: 0.4,
      },
    ],
  };

  const options = getLineChartOptions({
    plugins: {
      ...getLineChartOptions().plugins,
      tooltip: {
        ...getLineChartOptions().plugins?.tooltip,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "rgb(15, 23, 42)",
        bodyColor: "rgb(71, 85, 105)",
        borderColor: "rgba(6, 236, 158, 0.2)",
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          title: (tooltipItems: Array<{ label?: string }>) => {
            return tooltipItems[0]?.label || "";
          },
          label: (tooltipItem: { dataset: { label?: string }; parsed: { y: number } }) => {
            const datasetLabel = tooltipItem.dataset.label || "";
            const value = tooltipItem.parsed.y;

            if (datasetLabel.includes("Cost")) {
              return `${datasetLabel}: ${formatCurrency(value)}`;
            } else {
              return `${datasetLabel}: ${value.toLocaleString()}`;
            }
          },
        },
      },
      legend: {
        ...getLineChartOptions().plugins?.legend,
        display: true,
      },
    },
    scales: {
      ...getLineChartOptions().scales,
      x: {
        ...getLineChartOptions().scales?.x,
        grid: {
          display: false,
        },
      },
      y: {
        ...getLineChartOptions().scales?.y,
        position: "left" as const,
        beginAtZero: true,
        grid: {
          color: "rgba(6, 236, 158, 0.1)",
        },
        ticks: {
          ...getLineChartOptions().scales?.y?.ticks,
          callback: (value: number | string) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            if (maxCost > 1000) {
              return `$${(numValue / 1000).toFixed(1)}k`;
            }
            return formatCurrency(numValue);
          },
        },
      },
      y1: {
        type: "linear" as const,
        position: "right" as const,
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          callback: (value: number | string) => {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            if (maxCalls > 1000) {
              return `${(numValue / 1000).toFixed(1)}k`;
            }
            return numValue.toLocaleString();
          },
        },
      },
    },
    elements: {
      ...getLineChartOptions().elements,
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
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
          Cost vs API Calls
        </h3>
      </div>
      <div className="h-64 chart-container rounded-xl">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
