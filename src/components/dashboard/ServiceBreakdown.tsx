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
      <div className="card p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
            <span className="text-lg">🍰</span>
          </div>
          <h3 className="text-xl font-display font-bold gradient-text">
            Service Breakdown
          </h3>
        </div>
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
    <div className="card p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30 hover:scale-105 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-primary p-2 rounded-lg glow-primary">
          <span className="text-lg">🍰</span>
        </div>
        <h3 className="text-xl font-display font-bold gradient-text">
          Service Breakdown
        </h3>
      </div>
      <div className="relative h-64 chart-container">
        <Doughnut data={chartData} options={options} />
        <div className="flex absolute inset-0 justify-center items-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-display font-bold gradient-text">
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
            className="flex justify-between items-center p-3 glass rounded-xl border border-primary-200/30 hover:bg-primary-500/5 transition-all duration-300"
          >
            <div className="flex gap-3 items-center">
              <div
                className="w-4 h-4 rounded-full shadow-lg"
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
              <p className="text-lg font-display font-bold gradient-text">
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
