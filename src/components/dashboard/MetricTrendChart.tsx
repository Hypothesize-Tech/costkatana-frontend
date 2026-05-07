import { Line } from "react-chartjs-2";
import {
  getLineChartOptions,
  generateLineChartData,
} from "@/utils/chartConfig";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import type { EvalsTimelinePoint } from "@/services/evals.service";

interface MetricTrendChartProps {
  data: EvalsTimelinePoint[];
  loading?: boolean;
  title?: string;
}

export const MetricTrendChart: React.FC<MetricTrendChartProps> = ({
  data,
  loading,
  title = "Quality over time",
}) => {
  if (loading) {
    return (
      <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold font-display gradient-text-primary">
            {title}
          </h3>
        </div>
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  const labels = data.map((d) =>
    new Date(d.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  );

  const chartData = generateLineChartData(labels, [
    {
      label: "Overall",
      data: data.map((d) => d.overall),
      color: "#3B82F6",
      fill: true,
    },
    {
      label: "Faithfulness",
      data: data.map((d) => d.answerFaithfulness),
      color: "#10B981",
    },
    {
      label: "Relevance",
      data: data.map((d) => d.answerRelevance),
      color: "#F59E0B",
    },
    {
      label: "Context relevance",
      data: data.map((d) => d.contextRelevance),
      color: "#8B5CF6",
    },
  ]);

  const baseOptions = getLineChartOptions();
  const options = getLineChartOptions({
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      y: {
        ...baseOptions.scales?.y,
        min: 0,
        max: 1,
        ticks: {
          ...baseOptions.scales?.y?.ticks,
          callback: (value: number | string) =>
            typeof value === "number" ? value.toFixed(2) : value,
        },
      },
    },
  });

  return (
    <div className="group p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
          <ChartBarIcon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold font-display gradient-text-primary">
          {title}
        </h3>
      </div>
      <div className="h-64 chart-container rounded-xl">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MetricTrendChart;
