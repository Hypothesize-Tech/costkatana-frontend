import React, { useState, useEffect } from "react";
import { Line, Doughnut, Scatter } from "react-chartjs-2";
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
} from "chart.js";
import AdvancedMonitoringService, {
  TagAnalytics,
  RealTimeMetrics,
  CostForecast,
  PerformanceCorrelation,
} from "../../services/advancedMonitoring.service";
import { authService } from "../../services/auth.service";

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
);

const AdvancedCostMonitoring: React.FC = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    "realtime" | "forecast" | "performance" | "tags"
  >("realtime");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("30d");
  const [realTimeData, setRealTimeData] = useState<RealTimeMetrics[]>([]);
  const [costForecast, setCostForecast] = useState<CostForecast | null>(null);
  const [performanceData, setPerformanceData] = useState<
    PerformanceCorrelation[]
  >([]);
  const [tagAnalytics, setTagAnalytics] = useState<TagAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);

  // Tag management states
  const [newTagName, setNewTagName] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);

  // Sample tags for demonstration
  const sampleTags = [
    "production",
    "development",
    "testing",
    "staging",
    "frontend",
    "backend",
    "api",
    "ml-model",
    "gpt-4",
    "gpt-3.5",
    "claude",
    "gemini",
    "high-priority",
    "routine",
    "experimental",
    "customer-facing",
    "internal",
    "data-processing",
  ];

  // Initialize available tags with samples
  useEffect(() => {
    setAvailableTags([...sampleTags]);
  }, []);

  // Add tag filter functionality
  const handleTagFilter = (tags: string[]) => {
    setSelectedTags(tags);
    // Trigger data refresh with selected tags
    fetchData();
  };

  // Add new tag
  const handleAddTag = () => {
    if (newTagName.trim() && !availableTags.includes(newTagName.trim())) {
      const newTag = newTagName.trim();
      setAvailableTags([...availableTags, newTag]);
      setNewTagName("");
      setIsAddingTag(false);

      // Optionally add to selected tags
      setSelectedTags([...selectedTags, newTag]);

      // Refresh data with new tag
      fetchData();
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setAvailableTags(availableTags.filter((tag) => tag !== tagToRemove));
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
    fetchData();
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchRealTimeData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeRange, selectedTags]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setAuthError(false);

    // Check if user is authenticated before making API calls
    if (!authService.isAuthenticated()) {
      setAuthError(true);
      setError("Please log in to view advanced cost monitoring data.");
      setLoading(false);
      return;
    }

    try {
      const filterParams = {
        timeRange,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };

      console.log("Using filter params:", filterParams);
      await Promise.all([
        fetchTagAnalytics(),
        fetchRealTimeData(),
        fetchCostForecast(),
        fetchPerformanceCorrelations(),
      ]);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 403) {
        setAuthError(true);
        setError("Authentication required. Please log in to view this data.");
      } else if (error.response?.status === 401) {
        setAuthError(true);
        setError("Session expired. Please log in again.");
      } else if (
        error.code === "ECONNABORTED" ||
        error.message?.includes("timeout")
      ) {
        setError(
          "Request timed out. The server may be unavailable or overloaded.",
        );
      } else {
        setError("An error occurred while fetching data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTagAnalytics = async () => {
    try {
      const data = await AdvancedMonitoringService.getTagAnalytics({
        timeRange,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      // Only set data if we have real data
      if (data && data.length > 0) {
        setTagAnalytics(data);
      } else {
        setTagAnalytics([]);
      }
    } catch (error) {
      console.error("Error fetching tag analytics:", error);
      setTagAnalytics([]);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const data = await AdvancedMonitoringService.getRealTimeMetrics({
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });

      // Only set data if we have real data
      if (data && data.length > 0) {
        setRealTimeData(data);
      } else {
        setRealTimeData([]);
      }
    } catch (error) {
      console.error("Error fetching real-time data:", error);
      setRealTimeData([]);
    }
  };

  const fetchCostForecast = async () => {
    try {
      const data = await AdvancedMonitoringService.generateCostForecast({
        forecastType: "daily",
        timeHorizon: 30,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setCostForecast(data);
    } catch (error) {
      console.error("Error fetching cost forecast:", error);
      setCostForecast(null);
    }
  };

  const fetchPerformanceCorrelations = async () => {
    try {
      const data =
        await AdvancedMonitoringService.analyzeCostPerformanceCorrelation({
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          timeRange,
        });
      setPerformanceData(data);
    } catch (error) {
      console.error("Error fetching performance correlations:", error);
      setPerformanceData([]);
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "↗️";
      case "down":
        return "↘️";
      default:
        return "→";
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-red-500";
      case "down":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getPerformanceRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "fair":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const generateForecastChartData = () => {
    if (
      !costForecast ||
      !costForecast.forecasts ||
      costForecast.forecasts.length === 0
    ) {
      return null;
    }

    // Better date parsing and formatting for real data
    const labels = costForecast.forecasts.map((f: any) => {
      let date;
      try {
        // Try different date field names and formats
        const dateStr = f.period || f.date || f.timestamp;
        date = new Date(dateStr);

        // Check if date is valid
        if (isNaN(date.getTime())) {
          // Fallback to current date + index
          date = new Date();
          date.setDate(date.getDate() + costForecast.forecasts.indexOf(f));
        }
      } catch (error) {
        // Fallback to current date + index
        date = new Date();
        date.setDate(date.getDate() + costForecast.forecasts.indexOf(f));
      }

      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });

    return {
      labels: labels,
      datasets: [
        {
          label: "Predicted Cost ($)",
          data: costForecast.forecasts.map((f: any) => f.predictedCost || 0),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "rgb(59, 130, 246)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          yAxisID: "y",
        },
        {
          label: "Confidence Level (%)",
          data: costForecast.forecasts.map((f: any) =>
            ((f.confidence || 0.7) * 100).toFixed(1),
          ),
          borderColor: "rgb(16, 185, 129)",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: false,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          pointBackgroundColor: "rgb(16, 185, 129)",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          yAxisID: "y1",
          borderDash: [5, 5],
        },
      ],
    };
  };

  const generateTagDistributionData = () => {
    if (!tagAnalytics || tagAnalytics.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: [],
          },
        ],
      };
    }

    return {
      labels: tagAnalytics.map((tag) => tag.tag),
      datasets: [
        {
          data: tagAnalytics.map((tag) => tag.totalCost),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#36A2EB",
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#FF6384",
            "#36A2EB",
          ],
        },
      ],
    };
  };

  const generatePerformanceScatterData = () => {
    if (!performanceData || performanceData.length === 0) {
      return {
        datasets: [
          {
            label: "Cost vs Performance",
            data: [],
            backgroundColor: [],
          },
        ],
      };
    }

    return {
      datasets: [
        {
          label: "Cost vs Performance",
          data: performanceData.map((corr) => ({
            x: corr.costPerRequest,
            y: corr.performance.latency,
            service: corr.service,
            model: corr.model,
            efficiency: corr.efficiency.costEfficiencyScore,
          })),
          backgroundColor: performanceData.map((corr) => {
            const efficiency = corr.efficiency.costEfficiencyScore;
            if (efficiency > 0.8) return "rgba(34, 197, 94, 0.6)";
            if (efficiency > 0.6) return "rgba(59, 130, 246, 0.6)";
            if (efficiency > 0.4) return "rgba(245, 158, 11, 0.6)";
            return "rgba(239, 68, 68, 0.6)";
          }),
        },
      ],
    };
  };

  const renderRealTimeTab = () => (
    <div className="space-y-8">
      {realTimeData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {realTimeData.map((metric) => (
              <div key={metric.tag} className="card p-6 hover:scale-105 transition-all duration-300 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-display font-semibold gradient-text">
                    {metric.tag}
                  </span>
                  <span className="bg-gradient-success text-white px-2 py-1 rounded-lg text-xs font-display font-bold animate-pulse">Live</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Current Cost</span>
                    <span className="text-lg font-display font-bold gradient-text">
                      ${metric.currentCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Hourly Rate</span>
                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      ${metric.hourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      Daily Projection
                    </span>
                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      ${metric.projectedDailyCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      Monthly Projection
                    </span>
                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      ${metric.projectedMonthlyCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-8 shadow-2xl backdrop-blur-xl border border-primary-200/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-accent p-2 rounded-lg glow-accent">
                <span className="text-lg text-white">🍰</span>
              </div>
              <h3 className="text-xl font-display font-bold gradient-text">
                Tag Cost Distribution
              </h3>
            </div>
            <div className="h-64">
              {generateTagDistributionData().labels.length > 0 ? (
                <Doughnut
                  data={generateTagDistributionData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                          },
                          color: '#374151'
                        }
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🍰</div>
                    <p className="text-lg font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                      No tag distribution data available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center shadow-2xl backdrop-blur-xl border border-primary-200/30">
          <div className="text-8xl mb-6">🔴</div>
          <p className="text-2xl font-display font-bold gradient-text mb-4">No real-time data available</p>
          <p className="text-lg font-body text-light-text-secondary dark:text-dark-text-secondary">
            Start using AI services to see real-time metrics
          </p>
        </div>
      )}
    </div>
  );

  const renderForecastTab = () => (
    <div className="space-y-6">
      {/* Budget Alerts */}
      {costForecast?.budgetAlerts && costForecast.budgetAlerts.length > 0 && (
        <div className="p-4 mt-4 bg-red-50 rounded-lg border border-red-200">
          {costForecast.budgetAlerts.map((alert: any, index: number) => (
            <div key={index} className="flex items-center text-red-700">
              <span className="mr-2">⚠️</span>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Cost Forecast (30 Days)
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Cost</span>
            </div>
            <div className="flex items-center space-x-1">
              <div
                className="w-3 h-1 bg-green-500 rounded-full"
                style={{ borderStyle: "dashed" }}
              ></div>
              <span className="text-sm text-gray-600">Confidence</span>
            </div>
          </div>
        </div>
        <div className="relative h-64">
          {(() => {
            const chartData = generateForecastChartData();
            if (
              !chartData ||
              !chartData.labels ||
              chartData.labels.length === 0
            ) {
              return (
                <div className="flex justify-center items-center h-full bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No forecast data available</p>
                </div>
              );
            }
            return (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: "index" as const,
                    intersect: false,
                  },
                  plugins: {
                    title: {
                      display: false,
                    },
                    legend: {
                      display: true,
                      position: "top" as const,
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12,
                        },
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff",
                      borderColor: "#374151",
                      borderWidth: 1,
                      cornerRadius: 8,
                      padding: 12,
                      displayColors: true,
                      callbacks: {
                        title: (context: any) => {
                          return `Date: ${context[0].label}`;
                        },
                        label: (context: any) => {
                          const label = context.dataset.label || "";
                          const value = context.parsed.y;

                          if (label.includes("Cost")) {
                            return `${label}: $${value.toFixed(2)}`;
                          } else if (label.includes("Confidence")) {
                            return `${label}: ${value}%`;
                          }
                          return `${label}: ${value}`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      display: true,
                      title: {
                        display: true,
                        text: "Date",
                        font: {
                          size: 12,
                          weight: "bold",
                        },
                      },
                      grid: {
                        display: true,
                        color: "rgba(0, 0, 0, 0.1)",
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                      },
                    },
                    y: {
                      type: "linear" as const,
                      display: true,
                      position: "left" as const,
                      title: {
                        display: true,
                        text: "Predicted Cost ($)",
                        font: {
                          size: 12,
                          weight: "bold",
                        },
                      },
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: "rgba(59, 130, 246, 0.1)",
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                        callback: function (value: any) {
                          return "$" + value.toFixed(2);
                        },
                      },
                    },
                    y1: {
                      type: "linear" as const,
                      display: true,
                      position: "right" as const,
                      title: {
                        display: true,
                        text: "Confidence Level (%)",
                        font: {
                          size: 12,
                          weight: "bold",
                        },
                      },
                      min: 0,
                      max: 100,
                      grid: {
                        drawOnChartArea: false,
                        color: "rgba(16, 185, 129, 0.1)",
                      },
                      ticks: {
                        font: {
                          size: 11,
                        },
                        callback: function (value: any) {
                          return value + "%";
                        },
                      },
                    },
                  },
                  elements: {
                    line: {
                      borderWidth: 2,
                    },
                    point: {
                      hoverBorderWidth: 3,
                    },
                  },
                }}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {performanceData.length > 0 ? (
        <>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-semibold">
              Cost vs Performance Correlation
            </h3>
            <div className="h-64">
              {generatePerformanceScatterData().datasets[0].data.length > 0 ? (
                <Scatter
                  data={generatePerformanceScatterData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Cost per Request ($)",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Latency (ms)",
                        },
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context: any) => {
                            const point = context.raw;
                            return [
                              `${point.service} - ${point.model}`,
                              `Cost: $${point.x.toFixed(4)}`,
                              `Latency: ${point.y.toFixed(0)}ms`,
                              `Efficiency: ${(point.efficiency * 100).toFixed(1)}%`,
                            ];
                          },
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">
                    No performance correlation data available
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {performanceData.map((corr, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {corr.service} - {corr.model}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceRatingColor(
                      corr.efficiency.performanceRating,
                    )}`}
                  >
                    {corr.efficiency.performanceRating}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Cost/Request</span>
                    <span className="text-sm">
                      ${corr.costPerRequest.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Latency</span>
                    <span className="text-sm">
                      {corr.performance.latency.toFixed(0)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Quality</span>
                    <span className="text-sm">
                      {(corr.performance.qualityScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Efficiency</span>
                    <span className="text-sm">
                      {(corr.efficiency.costEfficiencyScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
          <div className="text-center">
            <p className="text-gray-500 text-lg">
              No performance data available
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Performance correlation data will appear here when available
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderTagsTab = () => (
    <div className="space-y-6">
      {/* Tag Management Section */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold">Tag Management</h3>

        {/* Available Tags */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Available Tags:
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center px-3 py-1 bg-gray-100 rounded-full"
              >
                <span className="text-sm text-gray-700">{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  title="Remove tag"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Tag */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Add New Tag:
          </label>
          <div className="flex gap-2">
            {isAddingTag ? (
              <>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="flex-1 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingTag(false);
                    setNewTagName("");
                  }}
                  className="px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
              >
                + Add Tag
              </button>
            )}
          </div>
        </div>

        {/* Selected Tags Filter */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Filter by tags (click to select/deselect):
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const newTags = selectedTags.includes(tag)
                    ? selectedTags.filter((t) => t !== tag)
                    : [...selectedTags, tag];
                  handleTagFilter(newTags);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="flex gap-2 items-center mt-2">
              <span className="text-sm text-gray-600">
                Selected: {selectedTags.join(", ")}
              </span>
              <button
                onClick={() => handleTagFilter([])}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tag Analytics */}
      {tagAnalytics.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tagAnalytics.map((tag) => (
            <div key={tag.tag} className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {tag.tag}
                </span>
                <span className={`text-sm ${getTrendColor(tag.trend)}`}>
                  {getTrendIcon(tag.trend)} {tag.trendPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Total Cost</span>
                  <span className="text-sm font-semibold">
                    ${tag.totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Total Calls</span>
                  <span className="text-sm">
                    {tag.totalCalls.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Avg Cost/Call</span>
                  <span className="text-sm">${tag.averageCost.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
          <div className="text-center">
            <p className="text-gray-500 text-lg">
              No tag analytics data available
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Tag analytics will appear here when you have tagged usage data
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 light:bg-gradient-light-ambient dark:bg-gradient-dark-ambient min-h-screen relative overflow-hidden p-8">
        {/* Ambient Glow Effects */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-primary p-3 rounded-xl glow-primary">
              <span className="text-2xl">📈</span>
            </div>
            <h2 className="text-3xl font-display font-bold gradient-text">
              Advanced Cost Monitoring
            </h2>
          </div>
          <button
            onClick={fetchData}
            className="btn-primary font-display font-semibold"
          >
            Retry
          </button>
        </div>
        <div className={`card p-6 shadow-2xl backdrop-blur-xl border animate-scale-in relative z-10 ${authError
          ? "border-warning-200/30"
          : "border-danger-200/30"
          }`} style={{
            background: authError
              ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.1), rgba(254, 228, 64, 0.1))'
              : 'linear-gradient(90deg, rgba(255, 79, 100, 0.1), rgba(233, 78, 78, 0.1))'
          }}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${authError
              ? "bg-gradient-warning glow-warning"
              : "bg-gradient-danger glow-danger"
              }`}>
              <span className="text-lg text-white">⚠️</span>
            </div>
            <div>
              <h3 className={`text-lg font-display font-bold ${authError
                ? "text-warning-700 dark:text-warning-300"
                : "text-danger-700 dark:text-danger-300"
                }`}>
                {authError ? "Authentication Required" : "Error Loading Data"}
              </h3>
              <p className={`mt-1 font-body ${authError
                ? "text-warning-600 dark:text-warning-400"
                : "text-danger-600 dark:text-danger-400"
                }`}>
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 light:bg-gradient-light-ambient dark:bg-gradient-dark-ambient min-h-screen relative overflow-hidden p-8">
      {/* Ambient Glow Effects */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse"></div>

      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-primary p-3 rounded-xl glow-primary">
            <span className="text-2xl">📈</span>
          </div>
          <h2 className="text-3xl font-display font-bold gradient-text">
            Advanced Cost Monitoring
          </h2>
        </div>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as "24h" | "7d" | "30d")
            }
            className="px-4 py-3 border border-primary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 font-display font-semibold"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button
            onClick={fetchData}
            className="btn-primary font-display font-semibold px-6 py-3"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="card shadow-2xl backdrop-blur-xl border border-primary-200/30 relative z-10">
        <nav className="flex space-x-2 px-6">
          {[
            { key: "realtime", label: "Real-time", icon: "🔴" },
            { key: "forecast", label: "Forecast", icon: "🔮" },
            { key: "performance", label: "Performance", icon: "🚀" },
            { key: "tags", label: "Tags", icon: "🏷️" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-3 px-6 py-4 text-sm font-display font-semibold border-b-4 border-transparent transition-all duration-300 hover:scale-105 rounded-t-xl ${activeTab === tab.key
                ? "bg-gradient-primary text-white shadow-lg border-b-primary-500"
                : "text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 hover:bg-primary-500/10"
                }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "realtime" && renderRealTimeTab()}
      {activeTab === "forecast" && renderForecastTab()}
      {activeTab === "performance" && renderPerformanceTab()}
      {activeTab === "tags" && renderTagsTab()}
    </div>
  );
};

export default AdvancedCostMonitoring;
