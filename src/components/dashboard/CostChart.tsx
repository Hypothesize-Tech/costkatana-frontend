import { Line } from "react-chartjs-2";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  getLineChartOptions,
  generateLineChartData,
} from "@/utils/chartConfig";
import { TimeSeriesData } from "@/types";
import { ChartBarIcon } from "@heroicons/react/24/outline";

interface CostChartProps {
  data: TimeSeriesData[];
  loading?: boolean;
}

export const CostChart = ({ data, loading }: CostChartProps) => {
  if (loading) {
    return (
      <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold font-display gradient-text-primary">
            Cost Over Time
          </h3>
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  const chartData = generateLineChartData(
    data.map((d) => formatDate(d.date, "MMM d")),
    [
      {
        label: "Cost",
        data: data.map((d) => d.cost),
        color: "#3B82F6",
        fill: true,
      },
    ],
  );

  const options = getLineChartOptions({
    plugins: {
      ...getLineChartOptions().plugins,
      tooltip: {
        ...getLineChartOptions().plugins?.tooltip,
        callbacks: {
          label: (context: { parsed: { y: number } }) => {
            return `Cost: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      ...getLineChartOptions().scales,
      y: {
        ...getLineChartOptions().scales?.y,
        ticks: {
          ...getLineChartOptions().scales?.y?.ticks,
          callback: (value: number | string) => formatCurrency(typeof value === 'number' ? value : parseFloat(value)),
        },
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
          Cost Over Time
        </h3>
      </div>
      <div className="h-64 chart-container rounded-xl">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
