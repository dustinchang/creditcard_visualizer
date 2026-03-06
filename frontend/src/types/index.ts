export interface Transaction {
  date: string;
  merchant: string;
  amount: number;
}

export interface Category {
  transactions: Transaction[];
  total: number;
}

export interface CategoryAnalysis {
  [category: string]: Category;
}

export interface Refunds {
  transactions: Transaction[];
  total: number;
}

export interface AnalysisData {
  categories: CategoryAnalysis;
  refunds?: Refunds;
  grand_total: number;
}

export interface ApiResponse {
  analysis: string; // JSON string that needs to be parsed
  transaction_count: number;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: "uploading" | "success" | "error";
  analysisData?: AnalysisData;
}

export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
}
