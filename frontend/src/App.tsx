import { useState, useCallback, useEffect } from "react";
import { FileUpload } from "./components/FileUpload";
import { FileList } from "./components/FileList";
import { DataVisualization } from "./components/DataVisualization";
import { TransactionsList } from "./components/TransactionsList";
import { Refunds } from "./components/Refunds";
import type { UploadedFile, AnalysisData, ApiResponse } from "./types";
import {
  getAnalyzeEndpoint,
  formatErrorMessage,
  API_CONFIG,
} from "./config/api";
import "./App.css";

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(API_CONFIG.baseURL, { method: "GET" });
        if (response.ok) {
          setBackendStatus("online");
          console.log("✅ Backend connection: OK");
        } else {
          setBackendStatus("offline");
          console.error(
            "❌ Backend connection: Failed (status " + response.status + ")",
          );
        }
      } catch (error) {
        setBackendStatus("offline");
        console.error(
          "❌ Backend connection: Cannot reach " + API_CONFIG.baseURL,
        );
        console.error(
          "   Make sure backend is running: cd backend && cargo run",
        );
      }
    };
    checkBackend();
  }, []);

  // Real API call to Rust backend with OpenAI
  const uploadFile = async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", "Credit card transaction analysis");

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const response = await fetch(getAnalyzeEndpoint(), {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.details ||
            errorData?.message ||
            `Server error: ${response.statusText}`,
        );
      }

      const data: ApiResponse = await response.json();

      // Validate the response has the expected structure
      if (!data.analysis || typeof data.analysis !== "string") {
        throw new Error("Invalid response format from server");
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          "Request timed out. The AI analysis is taking longer than expected. Please try again.",
        );
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new Error(
          "Network error. Please check that the backend server is running on " +
            API_CONFIG.baseURL,
        );
      }

      console.error("Upload error:", error);
      throw error;
    }
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

    console.log(`📤 [1/3] Starting upload for: ${file.name}`);
    console.log(`📊 File size: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`🤖 Sending to OpenAI for AI analysis...`);
    console.log(`⏱️  This typically takes 1-5 minutes depending on file size`);
    console.log(`🔗 Endpoint: ${getAnalyzeEndpoint()}`);

    const startTime = Date.now();

    try {
      console.log(`⏳ [2/3] Uploading and waiting for OpenAI response...`);

      // Upload file and get analysis
      const response = await uploadFile(file);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ [3/3] Received response from backend in ${elapsed}s`);
      console.log(`📦 Response data:`, response);

      const analysisData: AnalysisData = JSON.parse(response.analysis);
      console.log(`✅ Successfully parsed analysis data`);
      console.log(
        `📊 Categories found: ${Object.keys(analysisData.categories).length}`,
      );
      console.log(`💰 Grand total: $${analysisData.grand_total.toFixed(2)}`);

      // Update file with success status and analysis data
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: "success", analysisData } : f,
        ),
      );

      console.log(`🎉 File processed successfully!`);
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`❌ Upload failed after ${elapsed}s:`, error);

      // Show formatted error message to user
      const errorMessage = formatErrorMessage(error);

      // Add more context to the error message
      let detailedMessage = `Failed to analyze file: ${errorMessage}\n\n`;

      if (errorMessage.includes("timeout")) {
        detailedMessage += "Tips:\n";
        detailedMessage +=
          "• OpenAI is taking longer than expected (>5 minutes)\n";
        detailedMessage += "• Try with a smaller CSV file\n";
        detailedMessage += "• Check your internet connection\n";
        detailedMessage += "• Make sure your OPENAI_API_KEY is valid";
      } else if (errorMessage.includes("Network error")) {
        detailedMessage += "Tips:\n";
        detailedMessage += "• Make sure backend is running: cargo run\n";
        detailedMessage += "• Check backend is on http://localhost:3000\n";
        detailedMessage += "• Look at backend terminal for errors";
      } else {
        detailedMessage +=
          "Check the browser console and backend logs for more details.";
      }

      alert(detailedMessage);

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
          <div
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              opacity: 0.9,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  backendStatus === "online"
                    ? "#10b981"
                    : backendStatus === "offline"
                      ? "#ef4444"
                      : "#f59e0b",
                display: "inline-block",
                boxShadow:
                  backendStatus === "online" ? "0 0 8px #10b981" : "none",
              }}
            ></span>
            <span>
              {backendStatus === "online"
                ? "Backend Connected"
                : backendStatus === "offline"
                  ? "Backend Offline"
                  : "Checking..."}
            </span>
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

              {/* Refunds Section */}
              {selectedFile?.analysisData?.refunds && (
                <section className="section">
                  <Refunds refundsData={selectedFile.analysisData.refunds} />
                </section>
              )}

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
