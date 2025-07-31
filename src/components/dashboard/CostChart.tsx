import { Line } from "react-chartjs-2";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  getLineChartOptions,
  generateLineChartData,
} from "@/utils/chartConfig";
import { TimeSeriesData } from "@/types";

interface CostChartProps {
  data: TimeSeriesData[];
  loading?: boolean;
}

export const CostChart = ({ data, loading }: CostChartProps) => {
  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Cost Over Time
        </h3>
        <div className="skeleton h-64" />
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
          label: (context: any) => {
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
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  });

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Cost Over Time
      </h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
