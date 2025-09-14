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
      <div className="card p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
            <span className="text-lg">📈</span>
          </div>
          <h3 className="text-xl font-display font-bold gradient-text">
            Cost Over Time
          </h3>
        </div>
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
    <div className="card p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 hover:scale-105 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
          <span className="text-lg">📈</span>
        </div>
        <h3 className="text-xl font-display font-bold gradient-text">
          Cost Over Time
        </h3>
      </div>
      <div className="h-64 chart-container">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
