import React, { useState, useEffect } from "react";
import { Doughnut, Scatter } from "react-chartjs-2";
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
import {
  ChartBarIcon,
  RocketLaunchIcon,
  TagIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PlusIcon,
  XMarkIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import AdvancedMonitoringService, {
  TagAnalytics,
  RealTimeMetrics,
  PerformanceCorrelation,
} from "../../services/advancedMonitoring.service";
import { authService } from "../../services/auth.service";
import { AdvancedMonitoringShimmer } from "../shimmer/AdvancedMonitoringShimmer";

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
    "realtime" | "performance" | "tags"
  >("realtime");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("30d");
  const [realTimeData, setRealTimeData] = useState<RealTimeMetrics[]>([]);
  const [performanceData, setPerformanceData] = useState<
    PerformanceCorrelation[]
  >([]);
  const [tagAnalytics, setTagAnalytics] = useState<TagAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);
  const [tabLoading, setTabLoading] = useState<Record<string, boolean>>({
    realtime: false,
    performance: false,
    tags: false,
  });

  // Tag management states
  const [newTagName, setNewTagName] = useState<string>("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

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

  // Track window width for responsive charts
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
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

  useEffect(() => {
    // Show shimmer when switching tabs
    setTabLoading(prev => ({ ...prev, [activeTab]: true }));

    const timer = setTimeout(() => {
      setTabLoading(prev => ({ ...prev, [activeTab]: false }));
    }, 500); // Short delay to show shimmer

    return () => clearTimeout(timer);
  }, [activeTab]);

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
        return "text-danger-500";
      case "down":
        return "text-success-500";
      default:
        return "text-light-text-secondary dark:text-dark-text-secondary";
    }
  };

  const getPerformanceRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "bg-success-100/50 text-success-700 dark:text-success-300";
      case "good":
        return "bg-primary-100/50 text-primary-700 dark:text-primary-300";
      case "fair":
        return "bg-accent-100/50 text-accent-700 dark:text-accent-300";
      case "poor":
        return "bg-danger-100/50 text-danger-700 dark:text-danger-300";
      default:
        return "bg-secondary-100/50 text-secondary-700 dark:text-secondary-300";
    }
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
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {realTimeData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 md:gap-5 md:grid-cols-2 lg:grid-cols-4">
            {realTimeData.map((metric) => (
              <div key={metric.tag} className="p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl sm:p-5 md:p-6">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-base font-semibold font-display gradient-text-primary sm:text-lg">
                    {metric.tag}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-display font-bold bg-gradient-success text-white border border-success-300/30 dark:border-success-500/20 animate-pulse sm:px-3 sm:py-1.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    Live
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">Current Cost</span>
                    <span className="text-base font-bold font-display gradient-text-primary sm:text-lg">
                      ${metric.currentCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">Hourly Rate</span>
                    <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">
                      ${metric.hourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                      Daily Projection
                    </span>
                    <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">
                      ${metric.projectedDailyCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                      Monthly Projection
                    </span>
                    <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">
                      ${metric.projectedMonthlyCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6 md:p-8">
            <div className="flex gap-2 items-center mb-4 sm:gap-3 sm:mb-6">
              <div className="p-2 rounded-xl shadow-lg bg-gradient-accent glow-accent sm:p-3">
                <ChartPieIcon className="w-5 h-5 text-white sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg font-bold font-display gradient-text-primary sm:text-xl">
                Tag Cost Distribution
              </h3>
            </div>
            <div className="h-48 sm:h-56 md:h-64">
              {generateTagDistributionData().labels.length > 0 ? (
                <Doughnut
                  data={generateTagDistributionData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: windowWidth < 640 ? "bottom" : "right",
                        labels: {
                          font: {
                            family: 'Inter, sans-serif',
                            size: windowWidth < 640 ? 10 : 12,
                            weight: 600
                          },
                          color: '#374151',
                          boxWidth: windowWidth < 640 ? 12 : 15,
                          padding: windowWidth < 640 ? 8 : 12
                        }
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl bg-gradient-accent/10 sm:mb-4 sm:w-16 sm:h-16">
                      <ChartPieIcon className="w-6 h-6 text-accent-500 dark:text-accent-400 sm:w-8 sm:h-8" />
                    </div>
                    <p className="text-sm font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary sm:text-base md:text-lg">
                      No tag distribution data available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="p-6 text-center rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-8 md:p-12">
          <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-2xl shadow-2xl bg-gradient-danger sm:mb-6 sm:w-20 sm:h-20">
            <ClockIcon className="w-8 h-8 text-white sm:w-10 sm:h-10" />
          </div>
          <p className="mb-3 text-xl font-bold font-display gradient-text-danger sm:mb-4 sm:text-2xl">No real-time data available</p>
          <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-base">
            Start using AI services to see real-time metrics
          </p>
        </div>
      )}
    </div>
  );


  const renderPerformanceTab = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {performanceData.length > 0 ? (
        <>
          <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-6">
            <div className="flex gap-2 items-center mb-3 sm:gap-3 sm:mb-4">
              <div className="p-2 rounded-xl shadow-lg bg-gradient-primary glow-primary sm:p-3">
                <RocketLaunchIcon className="w-5 h-5 text-white sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg font-bold font-display gradient-text-primary sm:text-xl">
                Cost vs Performance Correlation
              </h3>
            </div>
            <div className="h-48 sm:h-56 md:h-64">
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
                          font: {
                            size: windowWidth < 640 ? 11 : 12
                          }
                        },
                        ticks: {
                          font: {
                            size: windowWidth < 640 ? 10 : 11
                          }
                        }
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Latency (ms)",
                          font: {
                            size: windowWidth < 640 ? 11 : 12
                          }
                        },
                        ticks: {
                          font: {
                            size: windowWidth < 640 ? 10 : 11
                          }
                        }
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context: { raw: unknown }) => {
                            const point = context.raw as { service: string; model: string; x: number; y: number; efficiency: number };
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
                  <div className="text-center">
                    <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl bg-gradient-primary/10 sm:mb-4 sm:w-16 sm:h-16">
                      <RocketLaunchIcon className="w-6 h-6 text-primary-500 dark:text-primary-400 sm:w-8 sm:h-8" />
                    </div>
                    <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-base">
                      No performance correlation data available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {performanceData.map((corr, index) => (
              <div key={index} className="p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl sm:p-5 md:p-6">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">
                    {corr.service} - {corr.model}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-display font-semibold border ${getPerformanceRatingColor(
                      corr.efficiency.performanceRating,
                    )} sm:px-3 sm:py-1.5`}
                  >
                    {corr.efficiency.performanceRating}
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Cost/Request</span>
                    <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">
                      ${corr.costPerRequest.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Latency</span>
                    <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">
                      {corr.performance.latency.toFixed(0)}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Quality</span>
                    <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">
                      {(corr.performance.qualityScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Efficiency</span>
                    <span className="text-xs font-semibold font-display gradient-text-primary sm:text-sm">
                      {(corr.efficiency.costEfficiencyScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center py-12 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:py-16 md:py-20">
          <div className="text-center">
            <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl bg-gradient-primary/10 sm:mb-4 sm:w-16 sm:h-16">
              <RocketLaunchIcon className="w-6 h-6 text-primary-500 dark:text-primary-400 sm:w-8 sm:h-8" />
            </div>
            <p className="text-base font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary sm:text-lg">
              No performance data available
            </p>
            <p className="mt-2 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
              Performance correlation data will appear here when available
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderTagsTab = () => (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Tag Management Section */}
      <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-5 md:p-6">
        <div className="flex gap-2 items-center mb-4 sm:gap-3 sm:mb-5 md:mb-6">
          <div className="p-2 rounded-xl shadow-lg bg-gradient-primary glow-primary sm:p-3">
            <TagIcon className="w-5 h-5 text-white sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-lg font-bold font-display gradient-text-primary sm:text-xl">Tag Management</h3>
        </div>

        {/* Available Tags */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <label className="block mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary sm:mb-3 sm:text-sm">
            Available Tags:
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {availableTags.map((tag) => (
              <div
                key={tag}
                className="inline-flex gap-1.5 items-center px-3 py-1.5 rounded-full border transition-all duration-300 group glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50 hover:bg-primary-500/10 dark:hover:bg-primary-500/10 sm:gap-2 sm:px-4 sm:py-2"
              >
                <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="transition-colors text-danger-500 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300"
                  title="Remove tag"
                >
                  <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Tag */}
        <div className="mb-4 sm:mb-5 md:mb-6">
          <label className="block mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary sm:mb-3 sm:text-sm">
            Add New Tag:
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {isAddingTag ? (
              <>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="flex-1 input text-sm sm:text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleAddTag}
                    className="flex flex-1 gap-1.5 items-center justify-center btn btn-primary text-sm sm:flex-initial sm:gap-2"
                  >
                    <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="sm:inline">Add</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTag(false);
                      setNewTagName("");
                    }}
                    className="flex flex-1 gap-1.5 items-center justify-center btn btn-secondary text-sm sm:flex-initial sm:gap-2"
                  >
                    <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="sm:inline">Cancel</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="flex gap-1.5 items-center justify-center btn btn-success text-sm sm:gap-2"
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Add Tag</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Tags Filter */}
        <div>
          <label className="block mb-2 text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary sm:mb-3 sm:text-sm">
            Filter by tags (click to select/deselect):
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const newTags = selectedTags.includes(tag)
                    ? selectedTags.filter((t) => t !== tag)
                    : [...selectedTags, tag];
                  handleTagFilter(newTags);
                }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all duration-300 border ${selectedTags.includes(tag)
                  ? "bg-gradient-primary text-white shadow-lg glow-primary border-primary-300/30 dark:border-primary-500/20"
                  : "glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50 text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 dark:hover:bg-primary-500/10"
                  } sm:gap-1.5 sm:px-4 sm:py-2 sm:text-sm`}
              >
                <TagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {tag}
              </button>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-col gap-2 items-start p-3 mt-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 bg-primary-500/5 dark:bg-primary-500/10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:p-4 sm:mt-4">
              <span className="text-xs font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
                Selected: <span className="break-all sm:break-normal">{selectedTags.join(", ")}</span>
              </span>
              <button
                onClick={() => handleTagFilter([])}
                className="text-xs font-semibold transition-all duration-300 font-display gradient-text-primary hover:scale-110 sm:text-sm"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tag Analytics */}
      {tagAnalytics.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tagAnalytics.map((tag) => (
            <div key={tag.tag} className="p-4 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 group glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl sm:p-5 md:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="text-xs font-semibold font-display gradient-text-primary sm:text-sm">
                  {tag.tag}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-display font-semibold px-2 py-1 rounded-full border ${getTrendColor(tag.trend)} sm:gap-1.5 sm:px-3 sm:py-1.5`}>
                  {getTrendIcon(tag.trend)} {tag.trendPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                  <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Total Cost</span>
                  <span className="text-xs font-bold font-display gradient-text-primary sm:text-sm">
                    ${tag.totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                  <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Total Calls</span>
                  <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">
                    {tag.totalCalls.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 sm:p-3">
                  <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Avg Cost/Call</span>
                  <span className="text-xs font-semibold font-display text-light-text-primary dark:text-dark-text-primary sm:text-sm">${tag.averageCost.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-12 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:py-16 md:py-20">
          <div className="text-center">
            <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 rounded-xl bg-gradient-primary/10 sm:mb-4 sm:w-16 sm:h-16">
              <TagIcon className="w-6 h-6 text-primary-500 dark:text-primary-400 sm:w-8 sm:h-8" />
            </div>
            <p className="text-base font-semibold font-display text-light-text-secondary dark:text-dark-text-secondary sm:text-lg">
              No tag analytics data available
            </p>
            <p className="mt-2 text-xs font-body text-light-text-secondary dark:text-dark-text-secondary sm:text-sm">
              Tag analytics will appear here when you have tagged usage data
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (loading || tabLoading[activeTab]) {
    return <AdvancedMonitoringShimmer activeTab={activeTab} />;
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-fade-in sm:p-6 md:p-8">
        <div className="flex gap-2 items-center mb-4 sm:gap-3 sm:mb-5 md:gap-4 md:mb-6">
          <div className="p-2 rounded-xl shadow-lg bg-gradient-primary glow-primary sm:p-3 md:p-4">
            <ChartBarIcon className="w-6 h-6 text-white sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
          <h2 className="text-xl font-bold font-display gradient-text-primary sm:text-2xl md:text-3xl">
            Advanced Cost Monitoring
          </h2>
        </div>
        <div className={`p-4 rounded-xl border shadow-xl backdrop-blur-xl glass animate-fade-in sm:p-5 md:p-6 ${authError
          ? "bg-gradient-to-br border-warning-200/30 dark:border-warning-500/20 from-warning-50/50 to-warning-100/30 dark:from-warning-900/10 dark:to-warning-800/10"
          : "bg-gradient-to-br border-danger-200/30 dark:border-danger-500/20 from-danger-50/50 to-danger-100/30 dark:from-danger-900/10 dark:to-danger-800/10"
          }`}>
          <div className="flex flex-col gap-3 items-start sm:flex-row sm:items-center sm:gap-4">
            <div className={`p-2.5 rounded-xl shadow-lg ${authError
              ? "bg-gradient-warning glow-warning"
              : "bg-gradient-danger glow-danger"
              } sm:p-3 md:p-3.5`}>
              <ExclamationTriangleIcon className="w-5 h-5 text-white sm:w-6 sm:h-6 md:w-7 md:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-display font-bold mb-1 sm:text-xl sm:mb-2 ${authError
                ? "gradient-text-warning"
                : "gradient-text-danger"
                }`}>
                {authError ? "Authentication Required" : "Error Loading Data"}
              </h3>
              <p className={`text-sm font-body break-words sm:text-base ${authError
                ? "text-warning-600 dark:text-warning-400"
                : "text-danger-600 dark:text-danger-400"
                }`}>
                {error}
              </p>
            </div>
            <button
              onClick={fetchData}
              className="btn btn-primary shrink-0 w-full sm:w-auto"
            >
              <ArrowPathIcon className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 justify-between items-start sm:gap-5 md:gap-6 lg:flex-row lg:items-center">
        <div className="flex gap-2 items-center sm:gap-3 md:gap-4">
          <div className="p-2.5 rounded-xl shadow-xl bg-gradient-primary glow-primary sm:p-3 md:p-4">
            <ChartBarIcon className="w-6 h-6 text-white sm:w-7 sm:h-7 md:w-8 md:h-8" />
          </div>
          <h2 className="text-xl font-bold font-display gradient-text-primary sm:text-2xl md:text-3xl">
            Advanced Cost Monitoring
          </h2>
        </div>
        <div className="flex flex-col gap-2 items-stretch w-full sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <ClockIcon className="absolute left-2.5 top-1/2 z-10 w-4 h-4 transform -translate-y-1/2 pointer-events-none text-primary-500 dark:text-primary-400 sm:left-3 sm:w-5 sm:h-5" />
            <select
              value={timeRange}
              onChange={(e) =>
                setTimeRange(e.target.value as "24h" | "7d" | "30d")
              }
              className="input text-xs py-2 pl-9 pr-8 w-full appearance-none bg-white/90 dark:bg-dark-bg-300/90 border-primary-200/30 dark:border-primary-500/20 font-display font-semibold text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500/20 sm:text-sm sm:py-2.5 sm:pl-11 sm:pr-10 sm:min-w-[160px] sm:w-auto"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <button
            onClick={fetchData}
            className="flex gap-1.5 items-center justify-center btn btn-primary text-sm w-full sm:gap-2 sm:w-auto"
          >
            <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-3 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel sm:p-4">
        <nav className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:gap-3 sm:overflow-x-visible sm:pb-0">
          {[
            { key: "realtime", label: "Real-time", icon: ClockIcon },
            { key: "performance", label: "Performance", icon: RocketLaunchIcon },
            { key: "tags", label: "Tags", icon: TagIcon },
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "realtime" | "performance" | "tags")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-semibold text-xs transition-all duration-300 shrink-0 ${activeTab === tab.key
                  ? "bg-gradient-primary text-white shadow-xl glow-primary scale-105"
                  : "glass hover:bg-primary-500/10 dark:hover:bg-primary-500/10 text-light-text-primary dark:text-dark-text-primary border border-primary-200/30 dark:border-primary-500/20 hover:scale-105 hover:border-primary-300/50 dark:hover:border-primary-400/30"
                  } sm:gap-2.5 sm:px-6 sm:py-3 sm:text-sm`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 sm:w-5 sm:h-5 ${activeTab === tab.key ? 'text-white' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "realtime" && renderRealTimeTab()}
      {activeTab === "performance" && renderPerformanceTab()}
      {activeTab === "tags" && renderTagsTab()}
    </div>
  );
};

export default AdvancedCostMonitoring;
