import { Doughnut } from "react-chartjs-2";
import { formatCurrency, formatServiceName } from "@/utils/formatters";
import {
  getDoughnutChartOptions,
  generateDoughnutChartData,
} from "@/utils/chartConfig";
import { ServiceAnalytics } from "@/types";
import { AI_SERVICES } from "@/utils/constant";
import { ChartPieIcon } from "@heroicons/react/24/outline";

interface ServiceBreakdownProps {
  data: ServiceAnalytics[];
  loading?: boolean;
}

export const ServiceBreakdown = ({ data, loading }: ServiceBreakdownProps) => {
  if (loading) {
    return (
      <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
            <ChartPieIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold font-display gradient-text-primary">
            Service Breakdown
          </h3>
        </div>
        <div className="h-64 skeleton rounded-xl" />
      </div>
    );
  }

  const chartData = generateDoughnutChartData(
    data.map((d) => formatServiceName(d.service)),
    data.map((d) => d.totalCost),
    data.map(
      (d) =>
        AI_SERVICES[d.service as keyof typeof AI_SERVICES]?.color || "#999",
    ),
  );

  const options = getDoughnutChartOptions({
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { label?: string; parsed: number; dataset: { data: number[] } }) => {
            const label = context.label || "";
            const value = formatCurrency(context.parsed);
            const percentage = (
              (context.parsed /
                context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0,
                )) *
              100
            ).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  });

  const totalCost = data.reduce((sum, d) => sum + (d.totalCost || 0), 0);

  return (
    <div className="group p-8 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-[1.01] hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary group-hover:scale-110 transition-transform duration-300">
          <ChartPieIcon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold font-display gradient-text-primary">
          Service Breakdown
        </h3>
      </div>
      <div className="relative h-64 chart-container rounded-xl">
        <Doughnut data={chartData} options={options} />
        <div className="flex absolute inset-0 justify-center items-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-display font-bold gradient-text-primary">
              {formatCurrency(totalCost)}
            </p>
            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Total</p>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {data.map((service) => (
          <div
            key={service.service}
            className="group/item flex justify-between items-center p-4 rounded-xl border shadow-lg backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50 hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl"
          >
            <div className="flex gap-3 items-center">
              <div
                className="w-4 h-4 rounded-full shadow-lg border border-white/50 dark:border-gray-700/50"
                style={{
                  backgroundColor:
                    AI_SERVICES[service.service as keyof typeof AI_SERVICES]
                      ?.color || "#999",
                }}
              />
              <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                {formatServiceName(service.service)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-lg font-display font-bold gradient-text-primary">
                {formatCurrency(service.totalCost || 0)}
              </p>
              <p className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">
                {service.totalCalls} calls
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
