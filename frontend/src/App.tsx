import { useState, useCallback } from "react";
import { FileUpload } from "./components/FileUpload";
import { FileList } from "./components/FileList";
import { DataVisualization } from "./components/DataVisualization";
import { TransactionsList } from "./components/TransactionsList";
import type { UploadedFile, AnalysisData, ApiResponse } from "./types";
import "./App.css";

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock upload function - replace with actual API call to Rust backend
  const uploadFile = async (file: File): Promise<ApiResponse> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Log file name for debugging (remove in production)
    console.log("Uploading file:", file.name);

    // Mock response - in production, this would come from your Rust backend
    const mockResponse: ApiResponse = {
      analysis: JSON.stringify({
        categories: {
          Gas: {
            transactions: [
              {
                date: "2025-12-30",
                merchant: "PETRO-CANADA 91888",
                amount: 64.04,
              },
            ],
            total: 64.04,
          },
          Restaurants: {
            transactions: [
              {
                date: "2025-12-04",
                merchant: "UBER CANADA/UBEREATS",
                amount: 53.4,
              },
              {
                date: "2025-12-07",
                merchant: "BROWNS SOCIALHOUSE BRENTW",
                amount: 124.2,
              },
            ],
            total: 177.6,
          },
          Groceries: {
            transactions: [
              {
                date: "2025-12-06",
                merchant: "WHOLE FOODS MARKET",
                amount: 14.67,
              },
              {
                date: "2025-12-09",
                merchant: "SAVE ON FOODS #996",
                amount: 44.78,
              },
            ],
            total: 59.45,
          },
        },
        grand_total: 301.09,
      }),
      transaction_count: 5,
    };

    return mockResponse;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const fileId = `${Date.now()}-${file.name}`;

    // Add file with uploading status
    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: "uploading",
    };

    setFiles((prev) => [...prev, newFile]);
    setSelectedFileId(fileId);
    setIsUploading(true);

    try {
      // Upload file and get analysis
      const response = await uploadFile(file);
      const analysisData: AnalysisData = JSON.parse(response.analysis);

      // Update file with success status and analysis data
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "success", analysisData } : f,
        ),
      );
    } catch (error) {
      console.error("Upload failed:", error);

      // Update file with error status
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: "error" } : f)),
      );
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileRemove = useCallback(
    (fileId: string) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
      }
    },
    [selectedFileId],
  );

  const handleFileSelectFromList = useCallback((fileId: string) => {
    setSelectedFileId(fileId);
  }, []);

  const selectedFile = files.find((f) => f.id === selectedFileId);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>💳 Credit Card Visualizer</h1>
            <p>Analyze your spending patterns with beautiful visualizations</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-container">
          <div className="content-wrapper">
            {/* Left Column - Upload & Files */}
            <div className="left-column">
              {/* Upload Section */}
              <section className="section">
                <FileUpload
                  onFileSelect={handleFileSelect}
                  isUploading={isUploading}
                />
              </section>

              {/* Files List Section */}
              {files.length > 0 && (
                <section className="section">
                  <FileList
                    files={files}
                    onFileRemove={handleFileRemove}
                    onFileSelect={handleFileSelectFromList}
                    selectedFileId={selectedFileId || undefined}
                  />
                </section>
              )}
            </div>

            {/* Right Column - Visualization & Transactions */}
            <div className="right-column">
              <section className="section">
                <DataVisualization
                  analysisData={selectedFile?.analysisData || null}
                  fileName={selectedFile?.name}
                />
              </section>

              {/* Transactions List Section */}
              <section className="section">
                <TransactionsList
                  analysisData={selectedFile?.analysisData || null}
                />
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React, TypeScript, Recharts & Rust</p>
      </footer>
    </div>
  );
}

export default App;
