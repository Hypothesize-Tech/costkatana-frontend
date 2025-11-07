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
import { LoadingSpinner } from "../common/LoadingSpinner";

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
    <div className="space-y-6">
      {realTimeData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {realTimeData.map((metric) => (
              <div key={metric.tag} className="group p-6 rounded-xl border shadow-xl backdrop-blur-xl transition-all duration-300 glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-display font-semibold gradient-text-primary">
                    {metric.tag}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-bold bg-gradient-success text-white border border-success-300/30 dark:border-success-500/20 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                    Live
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Current Cost</span>
                    <span className="text-lg font-display font-bold gradient-text-primary">
                      ${metric.currentCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">Hourly Rate</span>
                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      ${metric.hourlyRate.toFixed(2)}/hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                    <span className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary">
                      Daily Projection
                    </span>
                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      ${metric.projectedDailyCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
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

          <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-accent glow-accent">
                <ChartPieIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-primary">
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
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-accent/10">
                      <ChartPieIcon className="w-8 h-8 text-accent-500 dark:text-accent-400" />
                    </div>
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
        <div className="p-12 text-center rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex justify-center items-center mx-auto mb-6 w-20 h-20 rounded-2xl shadow-2xl bg-gradient-danger">
            <ClockIcon className="w-10 h-10 text-white" />
          </div>
          <p className="text-2xl font-display font-bold gradient-text-danger mb-4">No real-time data available</p>
          <p className="text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
            Start using AI services to see real-time metrics
          </p>
        </div>
      )}
    </div>
  );


  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {performanceData.length > 0 ? (
        <>
          <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
                <RocketLaunchIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-primary">
                Cost vs Performance Correlation
              </h3>
            </div>
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
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-primary/10">
                      <RocketLaunchIcon className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                    </div>
                    <p className="text-base font-body text-light-text-secondary dark:text-dark-text-secondary">
                      No performance correlation data available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {performanceData.map((corr, index) => (
              <div key={index} className="group p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {corr.service} - {corr.model}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-display font-semibold border ${getPerformanceRatingColor(
                      corr.efficiency.performanceRating,
                    )}`}
                  >
                    {corr.efficiency.performanceRating}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Cost/Request</span>
                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      ${corr.costPerRequest.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Latency</span>
                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      {corr.performance.latency.toFixed(0)}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Quality</span>
                    <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                      {(corr.performance.qualityScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                    <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Efficiency</span>
                    <span className="text-sm font-display font-semibold gradient-text-primary">
                      {(corr.efficiency.costEfficiencyScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center py-20 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="text-center">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-primary/10">
              <RocketLaunchIcon className="w-8 h-8 text-primary-500 dark:text-primary-400" />
            </div>
            <p className="text-lg font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              No performance data available
            </p>
            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">
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
      <div className="p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl shadow-lg bg-gradient-primary glow-primary">
            <TagIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-display font-bold gradient-text-primary">Tag Management</h3>
        </div>

        {/* Available Tags */}
        <div className="mb-6">
          <label className="block mb-3 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
            Available Tags:
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <div
                key={tag}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50 hover:bg-primary-500/10 dark:hover:bg-primary-500/10 transition-all duration-300"
              >
                <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-danger-500 hover:text-danger-700 dark:text-danger-400 dark:hover:text-danger-300 transition-colors"
                  title="Remove tag"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Tag */}
        <div className="mb-6">
          <label className="block mb-3 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
            Add New Tag:
          </label>
          <div className="flex gap-3">
            {isAddingTag ? (
              <>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  className="flex-1 input"
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                />
                <button
                  onClick={handleAddTag}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingTag(false);
                    setNewTagName("");
                  }}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="btn btn-success flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Tag
              </button>
            )}
          </div>
        </div>

        {/* Selected Tags Filter */}
        <div>
          <label className="block mb-3 text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
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
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-display font-semibold transition-all duration-300 border ${selectedTags.includes(tag)
                  ? "bg-gradient-primary text-white shadow-lg glow-primary border-primary-300/30 dark:border-primary-500/20"
                  : "glass border-primary-200/30 dark:border-primary-500/20 bg-white/50 dark:bg-dark-bg-300/50 text-light-text-primary dark:text-dark-text-primary hover:bg-primary-500/10 dark:hover:bg-primary-500/10"
                  }`}
              >
                <TagIcon className="w-4 h-4" />
                {tag}
              </button>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-3 items-center mt-4 p-4 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20 bg-primary-500/5 dark:bg-primary-500/10">
              <span className="text-sm font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Selected: {selectedTags.join(", ")}
              </span>
              <button
                onClick={() => handleTagFilter([])}
                className="text-sm font-display font-semibold gradient-text-primary hover:scale-110 transition-all duration-300"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tag Analytics */}
      {tagAnalytics.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tagAnalytics.map((tag) => (
            <div key={tag.tag} className="group p-6 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-display font-semibold gradient-text-primary">
                  {tag.tag}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-display font-semibold px-3 py-1.5 rounded-full border ${getTrendColor(tag.trend)}`}>
                  {getTrendIcon(tag.trend)} {tag.trendPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                  <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Total Cost</span>
                  <span className="text-sm font-display font-bold gradient-text-primary">
                    ${tag.totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                  <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Total Calls</span>
                  <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">
                    {tag.totalCalls.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl border glass border-primary-200/30 dark:border-primary-500/20">
                  <span className="text-xs font-body text-light-text-secondary dark:text-dark-text-secondary">Avg Cost/Call</span>
                  <span className="text-sm font-display font-semibold text-light-text-primary dark:text-dark-text-primary">${tag.averageCost.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-20 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="text-center">
            <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-xl bg-gradient-primary/10">
              <TagIcon className="w-8 h-8 text-primary-500 dark:text-primary-400" />
            </div>
            <p className="text-lg font-display font-semibold text-light-text-secondary dark:text-dark-text-secondary">
              No tag analytics data available
            </p>
            <p className="text-sm font-body text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Tag analytics will appear here when you have tagged usage data
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center p-12 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
          <div className="flex justify-center items-center mx-auto mb-6 w-20 h-20 rounded-2xl shadow-2xl bg-gradient-primary glow-primary animate-pulse-slow">
            <ChartBarIcon className="w-10 h-10 text-white" />
          </div>
          <LoadingSpinner />
          <h3 className="mt-6 mb-3 text-2xl font-display font-bold gradient-text-primary">Loading Advanced Metrics</h3>
          <p className="text-base font-body text-light-text-secondary dark:text-dark-text-secondary">Fetching monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-xl border shadow-xl backdrop-blur-xl glass border-danger-200/30 dark:border-danger-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 rounded-xl shadow-lg bg-gradient-primary glow-primary">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold gradient-text-primary">
            Advanced Cost Monitoring
          </h2>
        </div>
        <div className={`p-6 rounded-xl border shadow-xl backdrop-blur-xl glass animate-fade-in ${authError
          ? "border-warning-200/30 dark:border-warning-500/20 bg-gradient-to-br from-warning-50/50 to-warning-100/30 dark:from-warning-900/10 dark:to-warning-800/10"
          : "border-danger-200/30 dark:border-danger-500/20 bg-gradient-to-br from-danger-50/50 to-danger-100/30 dark:from-danger-900/10 dark:to-danger-800/10"
          }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl shadow-lg ${authError
              ? "bg-gradient-warning glow-warning"
              : "bg-gradient-danger glow-danger"
              }`}>
              <ExclamationTriangleIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-display font-bold mb-2 ${authError
                ? "gradient-text-warning"
                : "gradient-text-danger"
                }`}>
                {authError ? "Authentication Required" : "Error Loading Data"}
              </h3>
              <p className={`text-base font-body ${authError
                ? "text-warning-600 dark:text-warning-400"
                : "text-danger-600 dark:text-danger-400"
                }`}>
                {error}
              </p>
            </div>
            <button
              onClick={fetchData}
              className="btn btn-primary shrink-0"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-6 justify-between items-start lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl shadow-xl bg-gradient-primary glow-primary">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold gradient-text-primary">
            Advanced Cost Monitoring
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 z-10 w-5 h-5 transform -translate-y-1/2 pointer-events-none text-primary-500 dark:text-primary-400" />
            <select
              value={timeRange}
              onChange={(e) =>
                setTimeRange(e.target.value as "24h" | "7d" | "30d")
              }
              className="input text-sm py-2.5 pl-11 pr-10 min-w-[160px] appearance-none bg-white/90 dark:bg-dark-bg-300/90 border-primary-200/30 dark:border-primary-500/20 font-display font-semibold text-light-text-primary dark:text-dark-text-primary focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <button
            onClick={fetchData}
            className="btn btn-primary flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-4 rounded-xl border shadow-xl backdrop-blur-xl glass border-primary-200/30 dark:border-primary-500/20 bg-gradient-light-panel dark:bg-gradient-dark-panel">
        <nav className="flex flex-wrap gap-3">
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
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-300 shrink-0 ${activeTab === tab.key
                  ? "bg-gradient-primary text-white shadow-xl glow-primary scale-105"
                  : "glass hover:bg-primary-500/10 dark:hover:bg-primary-500/10 text-light-text-primary dark:text-dark-text-primary border border-primary-200/30 dark:border-primary-500/20 hover:scale-105 hover:border-primary-300/50 dark:hover:border-primary-400/30"
                  }`}
              >
                <IconComponent className={`w-5 h-5 shrink-0 ${activeTab === tab.key ? 'text-white' : ''}`} />
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
