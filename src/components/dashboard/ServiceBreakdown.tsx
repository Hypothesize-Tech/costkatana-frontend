import { Doughnut } from "react-chartjs-2";
import { formatCurrency, formatServiceName } from "@/utils/formatters";
import {
  getDoughnutChartOptions,
  generateDoughnutChartData,
} from "@/utils/chartConfig";
import { ServiceAnalytics } from "@/types";
import { AI_SERVICES } from "@/utils/constant";

interface ServiceBreakdownProps {
  data: ServiceAnalytics[];
  loading?: boolean;
}

export const ServiceBreakdown = ({ data, loading }: ServiceBreakdownProps) => {
  if (loading) {
    return (
      <div className="p-6 card">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Service Breakdown
        </h3>
        <div className="h-64 skeleton" />
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
          label: (context: any) => {
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
    <div className="p-6 card">
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
        Service Breakdown
      </h3>
      <div className="relative h-64">
        <Doughnut data={chartData} options={options} />
        <div className="flex absolute inset-0 justify-center items-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalCost)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((service) => (
          <div
            key={service.service}
            className="flex justify-between items-center"
          >
            <div className="flex gap-2 items-center">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    AI_SERVICES[service.service as keyof typeof AI_SERVICES]
                      ?.color || "#999",
                }}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatServiceName(service.service)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(service.totalCost || 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {service.totalCalls} calls
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
