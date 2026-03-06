import { useMemo, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { AnalysisData, PieChartData } from "../types";
import "../styles/DataVisualization.css";

interface DataVisualizationProps {
  analysisData: AnalysisData | null;
  fileName?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: PieChartData;
  }>;
}

const COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#84cc16", // Lime
];

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PieChartData;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{data.name}</p>
        <p className="tooltip-value">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data.value)}
        </p>
        <p className="tooltip-percentage">
          {data.percentage.toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  analysisData,
  fileName,
}) => {
  const chartData: PieChartData[] = useMemo(() => {
    if (!analysisData) return [];

    return Object.entries(analysisData.categories)
      .map(([name, category]) => ({
        name,
        value: category.total,
        percentage: (category.total / analysisData.grand_total) * 100,
      }))
      .sort((a, b) => b.value - a.value);
  }, [analysisData]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const renderCustomLabel = useCallback((entry: any) => {
    const percentage = entry.percentage;
    // Only show label if slice is large enough (>5%)
    if (percentage < 5) return "";
    return `${percentage.toFixed(1)}%`;
  }, []);

  if (!analysisData) {
    return (
      <div className="data-visualization-container">
        <div className="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          <p>No data to visualize</p>
          <p className="empty-subtitle">
            Upload a file to see your spending analysis
          </p>
        </div>
      </div>
    );
  }

  const totalTransactions = Object.values(analysisData.categories).reduce(
    (sum, cat) => sum + cat.transactions.length,
    0,
  );

  return (
    <div className="data-visualization-container">
      <div className="card visualization-header">
        <div>
          <h2>Spending Analysis</h2>
          {fileName && <p className="file-name-display">File: {fileName}</p>}
        </div>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Spending</span>
            <span className="stat-value">
              {formatCurrency(analysisData.grand_total)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Transactions</span>
            <span className="stat-value">{totalTransactions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Categories</span>
            <span className="stat-value">
              {Object.keys(analysisData.categories).length}
            </span>
          </div>
        </div>
      </div>

      <div className="card chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={140}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const item = chartData.find((d) => d.name === value);
                return `${value} - ${formatCurrency(item?.value || 0)}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card category-breakdown">
        <h3>Category Breakdown</h3>
        <div className="category-list">
          {chartData.map((category, index) => (
            <div key={category.name} className="category-item">
              <div className="category-header">
                <div className="category-name-row">
                  <span
                    className="category-color"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>
                  <span className="category-name">{category.name}</span>
                </div>
                <span className="category-amount">
                  {formatCurrency(category.value)}
                </span>
              </div>
              <div className="category-bar-container">
                <div
                  className="category-bar"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                ></div>
              </div>
              <div className="category-details">
                <span className="category-percentage">
                  {category.percentage.toFixed(1)}%
                </span>
                <span className="category-transactions">
                  {analysisData.categories[category.name].transactions.length}{" "}
                  transactions
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
