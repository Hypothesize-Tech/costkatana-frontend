import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { CHART_COLORS } from "./constant";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Default chart options
export const defaultChartOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      cornerRadius: 8,
      titleFont: {
        size: 14,
        weight: "bold",
      },
      bodyFont: {
        size: 13,
      },
      usePointStyle: true,
    },
  },
};

// Line chart configuration
export const getLineChartOptions = (
  options?: Partial<ChartOptions<"line">>,
): ChartOptions<"line"> => ({
  ...defaultChartOptions,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2,
    },
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  ...options,
});

// Bar chart configuration
export const getBarChartOptions = (
  options?: Partial<ChartOptions<"bar">>,
): ChartOptions<"bar"> => ({
  ...defaultChartOptions,
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        font: {
          size: 11,
        },
      },
    },
  },
  elements: {
    bar: {
      borderRadius: 4,
      borderWidth: 0,
    },
  },
  ...options,
});

// Doughnut chart configuration
export const getDoughnutChartOptions = (
  options?: Partial<ChartOptions<"doughnut">>,
): ChartOptions<"doughnut"> => ({
  ...defaultChartOptions,
  cutout: "70%",
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      position: "right" as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12,
        },
      },
    },
  },
  ...options,
});

// Chart data generators
export const generateLineChartData = (
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
    fill?: boolean;
  }>,
) => ({
  labels,
  datasets: datasets.map((dataset, index) => ({
    label: dataset.label,
    data: dataset.data,
    borderColor: dataset.color || Object.values(CHART_COLORS)[index],
    backgroundColor: dataset.fill
      ? `${dataset.color || Object.values(CHART_COLORS)[index]}20`
      : "transparent",
    fill: dataset.fill || false,
  })),
});

export const generateBarChartData = (
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>,
) => ({
  labels,
  datasets: datasets.map((dataset, index) => ({
    label: dataset.label,
    data: dataset.data,
    backgroundColor: dataset.color || Object.values(CHART_COLORS)[index],
    borderColor: dataset.color || Object.values(CHART_COLORS)[index],
    borderWidth: 0,
  })),
});

export const generateDoughnutChartData = (
  labels: string[],
  data: number[],
  colors?: string[],
) => ({
  labels,
  datasets: [
    {
      data,
      backgroundColor:
        colors || Object.values(CHART_COLORS).slice(0, data.length),
      borderWidth: 0,
      hoverOffset: 4,
    },
  ],
});

// Gradient generators
export const createGradient = (
  ctx: CanvasRenderingContext2D,
  color: string,
  height: number,
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, `${color}40`);
  gradient.addColorStop(1, `${color}00`);
  return gradient;
};

// Formatters for chart tooltips
export const formatCurrencyTooltip = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumberTooltip = (value: number): string => {
  return new Intl.NumberFormat("en-US").format(value);
};

export const formatPercentageTooltip = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Chart update animations
export const chartUpdateAnimation = {
  duration: 750,
  easing: "easeInOutQuart" as const,
};

// Responsive chart heights
export const getChartHeight = (
  type: "small" | "medium" | "large" = "medium",
): number => {
  const heights = {
    small: 200,
    medium: 300,
    large: 400,
  };
  return heights[type];
};
