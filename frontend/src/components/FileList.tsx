import type { UploadedFile } from "../types";
import "../styles/FileList.css";

interface FileListProps {
  files: UploadedFile[];
  onFileRemove?: (fileId: string) => void;
  onFileSelect?: (fileId: string) => void;
  selectedFileId?: string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onFileRemove,
  onFileSelect,
  selectedFileId,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (files.length === 0) {
    return (
      <div className="file-list-container">
        <div className="empty-state">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <p>No files uploaded yet</p>
          <p className="empty-subtitle">Upload a CSV file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <h3>Uploaded Files</h3>
        <span className="badge">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </div>

      <div className="file-list">
        {files.map((file) => (
          <div
            key={file.id}
            className={`card file-item ${file.status} ${selectedFileId === file.id ? "selected" : ""}`}
            onClick={() => onFileSelect?.(file.id)}
          >
            <div className="file-icon">
              {file.status === "uploading" && (
                <div className="spinner-small"></div>
              )}
              {file.status === "success" && (
                <svg
                  width="24"
                  height="24"
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
              )}
              {file.status === "error" && (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>

            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-meta">
                <span>{formatFileSize(file.size)}</span>
                <span className="separator">•</span>
                <span>{formatDate(file.uploadedAt)}</span>
                {file.analysisData && (
                  <>
                    <span className="separator">•</span>
                    <span className="transaction-count">
                      {Object.values(file.analysisData.categories).reduce(
                        (sum, cat) => sum + cat.transactions.length,
                        0,
                      )}{" "}
                      transactions
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="file-status">
              {file.status === "uploading" && (
                <span className="badge badge-primary">
                  Analyzing with AI... (may take 2-3 min)
                </span>
              )}
              {file.status === "success" && (
                <span className="badge badge-success">Ready</span>
              )}
              {file.status === "error" && (
                <span className="badge badge-error">Failed</span>
              )}
            </div>

            {onFileRemove && file.status !== "uploading" && (
              <button
                className="icon-button file-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove(file.id);
                }}
                aria-label="Remove file"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
