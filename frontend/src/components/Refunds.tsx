import type { Refunds as RefundsData } from "../types";
import "../styles/Refunds.css";

interface RefundsProps {
  refundsData: RefundsData | null;
}

export const Refunds: React.FC<RefundsProps> = ({ refundsData }) => {
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

  if (!refundsData || refundsData.transactions.length === 0) {
    return null; // Don't show anything if no refunds
  }

  return (
    <div className="refunds-container">
      <div className="card refunds-card">
        <div className="refunds-header">
          <div className="refunds-title-row">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="refunds-icon"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 8 8 12 12 16" />
              <line x1="16" y1="12" x2="8" y2="12" />
            </svg>
            <h3>Refunds</h3>
            <span className="badge refunds-badge">
              {refundsData.transactions.length} refund
              {refundsData.transactions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="refunds-total">
            <span className="refunds-total-label">Total Refunded:</span>
            <span className="refunds-total-amount">
              {formatCurrency(refundsData.total)}
            </span>
          </div>
        </div>

        <div className="refunds-list">
          {refundsData.transactions
            .sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map((transaction, index) => (
              <div key={index} className="refund-item">
                <div className="refund-info">
                  <div className="refund-merchant">{transaction.merchant}</div>
                  <div className="refund-date">
                    {formatDate(transaction.date)}
                  </div>
                </div>
                <div className="refund-amount">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
        </div>

        <div className="refunds-note">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Refunds are not included in category spending totals</span>
        </div>
      </div>
    </div>
  );
};
