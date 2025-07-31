import React, { useState, useEffect } from "react";
import {
  FiTrendingUp,
  FiDollarSign,
  FiZap,
  FiPieChart,
  FiStar,
  FiTarget,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiBarChart2,
} from "react-icons/fi";
import { PromptTemplate } from "../../types/promptTemplate.types";

interface TemplateAnalyticsDashboardProps {
  onViewTemplate: (template: PromptTemplate) => void;
}

interface AnalyticsData {
  overview: {
    totalTemplates: number;
    totalUsage: number;
    totalSavings: number;
    averageRating: number;
    timeRange: string;
  };
  trends: {
    usageGrowth: number;
    savingsGrowth: number;
    newTemplates: number;
    engagementRate: number;
  };
  topTemplates: Array<{
    id: string;
    name: string;
    category: string;
    usage: number;
    savings: number;
    rating: number;
    trend: "up" | "down" | "stable";
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    usage: number;
    savings: number;
    color: string;
  }>;
  usageTimeline: Array<{
    date: string;
    usage: number;
    savings: number;
  }>;
  costAnalysis: {
    beforeTemplates: number;
    afterTemplates: number;
    savings: number;
    savingsPercentage: number;
    projectedAnnualSavings: number;
  };
}

export const TemplateAnalyticsDashboard: React.FC<
  TemplateAnalyticsDashboardProps
> = ({ onViewTemplate }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );

  // Mock analytics data
  const mockAnalyticsData: AnalyticsData = {
    overview: {
      totalTemplates: 24,
      totalUsage: 1847,
      totalSavings: 2450.75,
      averageRating: 4.6,
      timeRange: "30 days",
    },
    trends: {
      usageGrowth: 23.5,
      savingsGrowth: 18.2,
      newTemplates: 7,
      engagementRate: 78.5,
    },
    topTemplates: [
      {
        id: "1",
        name: "API Documentation Generator",
        category: "coding",
        usage: 247,
        savings: 485.2,
        rating: 4.8,
        trend: "up",
      },
      {
        id: "2",
        name: "Blog Post Template",
        category: "writing",
        usage: 189,
        savings: 342.5,
        rating: 4.5,
        trend: "up",
      },
      {
        id: "3",
        name: "Email Campaign Creator",
        category: "business",
        usage: 156,
        savings: 278.3,
        rating: 4.7,
        trend: "stable",
      },
      {
        id: "4",
        name: "Data Analysis Report",
        category: "analysis",
        usage: 134,
        savings: 295.8,
        rating: 4.6,
        trend: "up",
      },
      {
        id: "5",
        name: "Code Review Template",
        category: "coding",
        usage: 98,
        savings: 156.7,
        rating: 4.4,
        trend: "down",
      },
    ],
    categoryBreakdown: [
      {
        category: "coding",
        count: 8,
        usage: 567,
        savings: 892.4,
        color: "#3B82F6",
      },
      {
        category: "writing",
        count: 6,
        usage: 423,
        savings: 645.2,
        color: "#10B981",
      },
      {
        category: "business",
        count: 5,
        usage: 345,
        savings: 523.8,
        color: "#F59E0B",
      },
      {
        category: "analysis",
        count: 3,
        usage: 289,
        savings: 267.15,
        color: "#8B5CF6",
      },
      {
        category: "creative",
        count: 2,
        usage: 223,
        savings: 122.2,
        color: "#EF4444",
      },
    ],
    usageTimeline: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      usage: Math.floor(Math.random() * 100) + 20,
      savings: Math.floor(Math.random() * 150) + 30,
    })),
    costAnalysis: {
      beforeTemplates: 4250.3,
      afterTemplates: 1799.55,
      savings: 2450.75,
      savingsPercentage: 57.7,
      projectedAnnualSavings: 29409.0,
    },
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <FiArrowUp className="trend-icon up" />;
      case "down":
        return <FiArrowDown className="trend-icon down" />;
      default:
        return <div className="trend-icon stable">→</div>;
    }
  };

  if (loading || !analyticsData) {
    return (
      <div className="analytics-loading">
        <FiRefreshCw className="loading-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="template-analytics-dashboard">
      <style>{`
                .template-analytics-dashboard {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    background: #f8fafc;
                    min-height: 100vh;
                }

                .analytics-header {
                    margin-bottom: 2rem;
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .analytics-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1f2937;
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .analytics-subtitle {
                    color: #6b7280;
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }

                .header-controls {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .time-selector {
                    display: flex;
                    background: white;
                    border-radius: 10px;
                    padding: 0.25rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .time-option {
                    padding: 0.5rem 1rem;
                    border: none;
                    background: transparent;
                    color: #6b7280;
                    cursor: pointer;
                    border-radius: 8px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }

                .time-option.active {
                    background: #667eea;
                    color: white;
                }

                .refresh-btn {
                    background: white;
                    border: 1px solid #d1d5db;
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #374151;
                }

                .refresh-btn:hover {
                    background: #f9fafb;
                    border-color: #9ca3af;
                }

                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .overview-card {
                    background: white;
                    border-radius: 15px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                    position: relative;
                    overflow: hidden;
                }

                .overview-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: var(--card-color, #667eea);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }

                .card-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                    background: var(--card-color, #667eea);
                }

                .trend-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding: 0.25rem 0.5rem;
                    border-radius: 50px;
                }

                .trend-indicator.positive {
                    background: #d1fae5;
                    color: #065f46;
                }

                .trend-indicator.negative {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .card-value {
                    font-size: 2.2rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }

                .card-label {
                    color: #6b7280;
                    font-weight: 500;
                }

                .main-content {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .charts-section {
                    display: grid;
                    gap: 2rem;
                }

                .chart-card {
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                }

                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .chart-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .chart-placeholder {
                    height: 300px;
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    font-weight: 500;
                    position: relative;
                    overflow: hidden;
                }

                .chart-placeholder::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(99, 102, 241, 0.1) 10px,
                        rgba(99, 102, 241, 0.1) 20px
                    );
                }

                .sidebar-section {
                    display: grid;
                    gap: 2rem;
                    height: fit-content;
                }

                .top-templates {
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                }

                .section-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .template-list {
                    display: grid;
                    gap: 1rem;
                }

                .template-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 10px;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .template-item:hover {
                    background: #e2e8f0;
                    transform: translateY(-1px);
                }

                .template-info {
                    flex: 1;
                }

                .template-name {
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 0.25rem;
                }

                .template-category {
                    background: #e0e7ff;
                    color: #3730a3;
                    padding: 0.1rem 0.5rem;
                    border-radius: 50px;
                    font-size: 0.7rem;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .template-metrics {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 0.5rem;
                }

                .metric {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .template-trend {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .trend-icon {
                    width: 16px;
                    height: 16px;
                }

                .trend-icon.up {
                    color: #10b981;
                }

                .trend-icon.down {
                    color: #ef4444;
                }

                .trend-icon.stable {
                    color: #6b7280;
                    font-weight: bold;
                }

                .category-breakdown {
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                }

                .category-list {
                    display: grid;
                    gap: 1rem;
                }

                .category-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 10px;
                }

                .category-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .category-info {
                    flex: 1;
                }

                .category-name {
                    font-weight: 600;
                    color: #1f2937;
                    text-transform: capitalize;
                    margin-bottom: 0.25rem;
                }

                .category-stats {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .cost-analysis-section {
                    grid-column: 1 / -1;
                    background: white;
                    border-radius: 15px;
                    padding: 2rem;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                }

                .cost-comparison {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    margin-top: 1.5rem;
                }

                .cost-item {
                    text-align: center;
                    padding: 1.5rem;
                    background: #f8fafc;
                    border-radius: 12px;
                    position: relative;
                }

                .cost-item.savings {
                    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
                    border: 1px solid #6ee7b7;
                }

                .cost-value {
                    font-size: 1.8rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .cost-item.before .cost-value {
                    color: #dc2626;
                }

                .cost-item.after .cost-value {
                    color: #2563eb;
                }

                .cost-item.savings .cost-value {
                    color: #059669;
                }

                .cost-label {
                    color: #6b7280;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }

                .cost-item.savings .cost-label {
                    color: #065f46;
                }

                .cost-description {
                    font-size: 0.8rem;
                    color: #9ca3af;
                }

                .cost-item.savings .cost-description {
                    color: #047857;
                }

                .analytics-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 400px;
                    color: #6b7280;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    margin-bottom: 1rem;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 1024px) {
                    .main-content {
                        grid-template-columns: 1fr;
                    }
                    
                    .overview-grid {
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    }
                    
                    .cost-comparison {
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    }
                }

                @media (max-width: 768px) {
                    .template-analytics-dashboard {
                        padding: 1rem;
                    }
                    
                    .header-content {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1rem;
                    }
                    
                    .header-controls {
                        justify-content: center;
                    }
                    
                    .overview-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .template-item {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1rem;
                    }
                    
                    .template-metrics {
                        justify-content: space-between;
                    }
                }
            `}</style>

      <div className="analytics-header">
        <div className="header-content">
          <div>
            <h1 className="analytics-title">Template Analytics</h1>
            <p className="analytics-subtitle">
              Track your template performance, cost savings, and usage patterns
            </p>
          </div>

          <div className="header-controls">
            <div className="time-selector">
              {[
                { value: "7d", label: "7 Days" },
                { value: "30d", label: "30 Days" },
                { value: "90d", label: "90 Days" },
                { value: "1y", label: "1 Year" },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`time-option ${timeRange === option.value ? "active" : ""}`}
                  onClick={() => setTimeRange(option.value as any)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button className="refresh-btn" onClick={loadAnalytics}>
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="overview-grid">
        <div
          className="overview-card"
          style={{ "--card-color": "#667eea" } as any}
        >
          <div className="card-header">
            <div className="card-icon">
              <FiZap />
            </div>
            <div className="trend-indicator positive">
              <FiArrowUp />+{analyticsData.trends.usageGrowth}%
            </div>
          </div>
          <div className="card-value">
            {formatNumber(analyticsData.overview.totalUsage)}
          </div>
          <div className="card-label">Total Usage</div>
        </div>

        <div
          className="overview-card"
          style={{ "--card-color": "#10b981" } as any}
        >
          <div className="card-header">
            <div className="card-icon">
              <FiDollarSign />
            </div>
            <div className="trend-indicator positive">
              <FiArrowUp />+{analyticsData.trends.savingsGrowth}%
            </div>
          </div>
          <div className="card-value">
            {formatCurrency(analyticsData.overview.totalSavings)}
          </div>
          <div className="card-label">Total Savings</div>
        </div>

        <div
          className="overview-card"
          style={{ "--card-color": "#f59e0b" } as any}
        >
          <div className="card-header">
            <div className="card-icon">
              <FiTarget />
            </div>
            <div className="trend-indicator positive">
              <FiArrowUp />+{analyticsData.trends.newTemplates}
            </div>
          </div>
          <div className="card-value">
            {analyticsData.overview.totalTemplates}
          </div>
          <div className="card-label">Active Templates</div>
        </div>

        <div
          className="overview-card"
          style={{ "--card-color": "#8b5cf6" } as any}
        >
          <div className="card-header">
            <div className="card-icon">
              <FiStar />
            </div>
            <div className="trend-indicator positive">
              <FiArrowUp />
              {analyticsData.trends.engagementRate}%
            </div>
          </div>
          <div className="card-value">
            {analyticsData.overview.averageRating.toFixed(1)} ★
          </div>
          <div className="card-label">Average Rating</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="charts-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Usage & Savings Trend</h3>
              <div className="chart-controls">
                <FiBarChart2 />
              </div>
            </div>
            <div className="chart-placeholder">
              <div>
                <FiTrendingUp
                  style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                />
                <p>
                  Usage trending up {analyticsData.trends.usageGrowth}% this
                  period
                </p>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Template Performance</h3>
              <div className="chart-controls">
                <FiPieChart />
              </div>
            </div>
            <div className="chart-placeholder">
              <div>
                <FiPieChart
                  style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                />
                <p>Category distribution and performance metrics</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="top-templates">
            <h3 className="section-title">
              <FiTrendingUp />
              Top Performing Templates
            </h3>
            <div className="template-list">
              {analyticsData.topTemplates.map((template) => (
                <div
                  key={template.id}
                  className="template-item"
                  onClick={() => onViewTemplate(template as any)}
                >
                  <div className="template-info">
                    <div className="template-name">{template.name}</div>
                    <span className="template-category">
                      {template.category}
                    </span>
                    <div className="template-metrics">
                      <div className="metric">
                        <FiEye />
                        {formatNumber(template.usage)}
                      </div>
                      <div className="metric">
                        <FiDollarSign />
                        {formatCurrency(template.savings)}
                      </div>
                      <div className="metric">
                        <FiStar />
                        {template.rating}
                      </div>
                    </div>
                  </div>
                  <div className="template-trend">
                    {getTrendIcon(template.trend)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="category-breakdown">
            <h3 className="section-title">
              <FiPieChart />
              Category Breakdown
            </h3>
            <div className="category-list">
              {analyticsData.categoryBreakdown.map((category) => (
                <div key={category.category} className="category-item">
                  <div
                    className="category-color"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="category-info">
                    <div className="category-name">{category.category}</div>
                    <div className="category-stats">
                      <span>{category.count} templates</span>
                      <span>{formatNumber(category.usage)} uses</span>
                      <span>{formatCurrency(category.savings)} saved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="cost-analysis-section">
        <h3 className="section-title">
          <FiDollarSign />
          Cost Impact Analysis
        </h3>
        <div className="cost-comparison">
          <div className="cost-item before">
            <div className="cost-value">
              {formatCurrency(analyticsData.costAnalysis.beforeTemplates)}
            </div>
            <div className="cost-label">Before Templates</div>
            <div className="cost-description">
              Monthly AI costs without templates
            </div>
          </div>

          <div className="cost-item after">
            <div className="cost-value">
              {formatCurrency(analyticsData.costAnalysis.afterTemplates)}
            </div>
            <div className="cost-label">With Templates</div>
            <div className="cost-description">Current monthly AI costs</div>
          </div>

          <div className="cost-item savings">
            <div className="cost-value">
              {formatCurrency(analyticsData.costAnalysis.savings)}
            </div>
            <div className="cost-label">Monthly Savings</div>
            <div className="cost-description">
              {analyticsData.costAnalysis.savingsPercentage}% reduction
            </div>
          </div>

          <div className="cost-item savings">
            <div className="cost-value">
              {formatCurrency(
                analyticsData.costAnalysis.projectedAnnualSavings,
              )}
            </div>
            <div className="cost-label">Projected Annual Savings</div>
            <div className="cost-description">
              Based on current usage patterns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
