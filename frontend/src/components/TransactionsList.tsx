import { useState } from "react";
import type { AnalysisData } from "../types";
import "../styles/TransactionsList.css";

interface TransactionsListProps {
  analysisData: AnalysisData | null;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  analysisData,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (analysisData) {
      setExpandedCategories(new Set(Object.keys(analysisData.categories)));
    }
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (!analysisData) {
    return (
      <div className="transactions-list-container">
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
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p>No transactions to display</p>
          <p className="empty-subtitle">
            Upload a file to see transaction details
          </p>
        </div>
      </div>
    );
  }

  const categories = Object.entries(analysisData.categories).sort(
    ([, a], [, b]) => b.total - a.total,
  );

  const totalTransactions = categories.reduce(
    (sum, [, cat]) => sum + cat.transactions.length,
    0,
  );

  const allExpanded = expandedCategories.size === categories.length;

  return (
    <div className="transactions-list-container">
      <div className="transactions-header">
        <div className="transactions-title">
          <h3>Transactions</h3>
          <span className="badge">{totalTransactions} total</span>
        </div>
        <div className="transactions-actions">
          {allExpanded ? (
            <button className="btn btn-secondary" onClick={collapseAll}>
              Collapse All
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={expandAll}>
              Expand All
            </button>
          )}
        </div>
      </div>

      <div className="categories-list">
        {categories.map(([categoryName, category]) => {
          const isExpanded = expandedCategories.has(categoryName);
          const transactionCount = category.transactions.length;

          return (
            <div
              key={categoryName}
              className={`card category-section ${isExpanded ? "expanded" : ""}`}
            >
              <button
                className="category-toggle"
                onClick={() => toggleCategory(categoryName)}
                aria-expanded={isExpanded}
                aria-controls={`transactions-${categoryName}`}
              >
                <div className="category-toggle-left">
                  <svg
                    className="chevron-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span className="category-toggle-name">{categoryName}</span>
                  <span className="category-transaction-count">
                    {transactionCount}{" "}
                    {transactionCount === 1 ? "transaction" : "transactions"}
                  </span>
                </div>
                <span className="category-toggle-amount">
                  {formatCurrency(category.total)}
                </span>
              </button>

              {isExpanded && (
                <div
                  id={`transactions-${categoryName}`}
                  className="transactions-table-wrapper"
                >
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Merchant</th>
                        <th className="amount-column">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.transactions
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime(),
                        )
                        .map((transaction, index) => (
                          <tr key={index} className="transaction-row">
                            <td className="date-cell">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="merchant-cell">
                              {transaction.merchant}
                            </td>
                            <td className="amount-cell">
                              {formatCurrency(transaction.amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="total-row">
                        <td colSpan={2} className="total-label">
                          {categoryName} Total
                        </td>
                        <td className="total-amount">
                          {formatCurrency(category.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
