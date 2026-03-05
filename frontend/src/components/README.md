# Components Documentation

This directory contains the React components for the Credit Card Visualizer application.

## Overview

The application is composed of three main components:

1. **FileUpload** - Handles file uploading with drag-and-drop support
2. **FileList** - Displays a list of uploaded files with their status
3. **DataVisualization** - Renders interactive charts using Recharts

---

## FileUpload

A modern file upload component with drag-and-drop functionality.

### Props

```typescript
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}
```

### Usage

```tsx
import { FileUpload } from './components/FileUpload';

function App() {
  const handleFileSelect = (file: File) => {
    console.log('Selected file:', file);
    // Handle file upload logic
  };

  return (
    <FileUpload 
      onFileSelect={handleFileSelect}
      isUploading={false}
    />
  );
}
```

### Features

- Drag-and-drop file upload
- Click to browse files
- CSV file validation
- Loading state with spinner
- Hover and drag animations
- Responsive design
- Dark mode support
- Accessible (keyboard navigation, ARIA labels)

---

## FileList

Displays a list of uploaded files with their metadata and status.

### Props

```typescript
interface FileListProps {
  files: UploadedFile[];
  onFileRemove?: (fileId: string) => void;
  onFileSelect?: (fileId: string) => void;
  selectedFileId?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'success' | 'error';
  analysisData?: AnalysisData;
}
```

### Usage

```tsx
import { FileList } from './components/FileList';

function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  return (
    <FileList
      files={files}
      onFileRemove={(id) => setFiles(files.filter(f => f.id !== id))}
      onFileSelect={setSelectedFileId}
      selectedFileId={selectedFileId || undefined}
    />
  );
}
```

### Features

- File metadata display (name, size, upload date, transaction count)
- Status indicators (uploading, success, error)
- File selection highlighting
- Remove file functionality
- Empty state message
- Responsive design
- Dark mode support
- Accessible

---

## DataVisualization

Renders interactive charts and data breakdowns using Recharts.

### Props

```typescript
interface DataVisualizationProps {
  analysisData: AnalysisData | null;
  fileName?: string;
}

interface AnalysisData {
  categories: CategoryAnalysis;
  grand_total: number;
}

interface CategoryAnalysis {
  [category: string]: Category;
}

interface Category {
  transactions: Transaction[];
  total: number;
}
```

### Usage

```tsx
import { DataVisualization } from './components/DataVisualization';

function App() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  return (
    <DataVisualization
      analysisData={analysisData}
      fileName="statement_2025.csv"
    />
  );
}
```

### Features

- Interactive PieChart with Recharts
- Custom tooltips showing amount and percentage
- Summary statistics (total spending, transactions, categories)
- Category breakdown with progress bars
- Responsive chart sizing
- Color-coded categories
- Empty state when no data
- Dark mode support
- Accessible

### Chart Colors

The component uses a predefined color palette:

```javascript
const COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];
```

---

## Styling

Each component has its own CSS file in the `src/styles/` directory:

- `FileUpload.css`
- `FileList.css`
- `DataVisualization.css`

All styles support:
- Responsive design (mobile, tablet, desktop)
- Dark mode via `prefers-color-scheme`
- Reduced motion for accessibility
- Custom CSS variables for easy theming

---

## Type Definitions

All TypeScript types are defined in `src/types/index.ts`:

```typescript
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

export interface AnalysisData {
  categories: CategoryAnalysis;
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
  status: 'uploading' | 'success' | 'error';
  analysisData?: AnalysisData;
}

export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
}
```

---

## Best Practices

### State Management

The main `App.tsx` manages the application state:

```typescript
const [files, setFiles] = useState<UploadedFile[]>([]);
const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);
```

### File Upload Flow

1. User drops/selects a file via `FileUpload`
2. File is added to state with `status: 'uploading'`
3. File is uploaded to backend (Rust API)
4. Backend returns analysis data
5. File status updated to `'success'` with analysis data
6. Data visualization automatically updates

### Error Handling

```typescript
try {
  const response = await uploadFile(file);
  const analysisData: AnalysisData = JSON.parse(response.analysis);
  // Update with success
} catch (error) {
  console.error('Upload failed:', error);
  // Update with error status
}
```

---

## Integration with Rust Backend

Replace the mock `uploadFile` function in `App.tsx` with actual API calls:

```typescript
const uploadFile = async (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return response.json();
};
```

Or use rspc (already installed):

```typescript
import { rspc } from '@rspc/client';

// Configure rspc client
const client = rspc.createClient({
  // Configure your Rust backend URL
});

// Use in component
const uploadFile = async (file: File) => {
  const result = await client.mutation(['upload_file', file]);
  return result;
};
```

---

## Accessibility Features

All components follow WCAG 2.1 guidelines:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper labels for screen readers
- **Focus Indicators**: Clear focus states for all interactive elements
- **Color Contrast**: Meets WCAG AA standards
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **Semantic HTML**: Proper use of HTML5 elements

---

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

---

## Future Enhancements

Potential improvements for the components:

1. **FileUpload**
   - Multiple file upload
   - Upload progress bar
   - File size/type validation

2. **FileList**
   - Sorting and filtering
   - Bulk actions
   - Export functionality

3. **DataVisualization**
   - Additional chart types (line, bar, scatter)
   - Date range filtering
   - Merchant analysis
   - Export charts as PNG/PDF
   - Compare multiple files
   - Drill-down into categories

---

## Troubleshooting

### Charts not rendering

Ensure Recharts is installed:
```bash
npm install recharts --legacy-peer-deps
```

### Dark mode not working

Check system preferences or add manual toggle:
```css
[data-theme="dark"] {
  /* Dark mode styles */
}
```

### TypeScript errors

Ensure all dependencies are up to date:
```bash
npm install
```

---

## License

This project is licensed under the same license as the parent project.