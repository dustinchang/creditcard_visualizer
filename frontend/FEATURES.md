# Credit Card Visualizer - Features Overview

## 🎨 Visual Design

### Modern Gradient Header
- Beautiful purple gradient header with app title
- Clean, professional look
- Responsive typography

### Color Palette
- **Primary**: Indigo (#6366f1)
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Accent Colors**: Pink, Purple, Teal, Orange, Cyan, Lime

## 📤 File Upload Component

### Features
- **Drag & Drop Zone**
  - Visual feedback when dragging files over the zone
  - Border changes from dashed to solid on hover
  - Smooth scale animation when dragging

- **Click to Upload**
  - Click anywhere in the upload zone to browse files
  - File picker filters to CSV files only

- **Visual States**
  - Default: Gray dashed border with upload icon
  - Hover: Indigo border with lifted upload icon
  - Dragging: Indigo solid border with scaled zone
  - Uploading: Green border with spinner animation

- **User Feedback**
  - Clear instructions: "Drop your CSV file here, or click to browse"
  - Supported format message
  - Animated spinner during upload

## 📋 File List Component

### Display Information
Each file shows:
- **File Icon** (status-dependent)
  - Spinner: While uploading
  - Document icon: Successfully uploaded
  - Error icon: Failed upload

- **File Name** (truncated if too long)
- **File Size** (formatted: B, KB, MB)
- **Upload Date & Time** (e.g., "Dec 30, 2025 at 1:30 PM")
- **Transaction Count** (from analysis data)
- **Status Badge**
  - Blue "Uploading..." 
  - Green "Ready"
  - Red "Failed"

### Interactions
- **Click to Select** - Highlights file and loads its visualization
- **Hover Effect** - Subtle shadow and lift animation
- **Remove Button** - X icon appears on hover (except while uploading)
- **Empty State** - Shows document icon with helpful message when no files

### Visual States
- **Selected File**: Indigo border with light indigo background
- **Normal File**: White background with gray border
- **Uploading File**: Reduced opacity, cursor shows "wait"
- **Error File**: Red tinted background with red border

## 📊 Data Visualization Component

### Summary Statistics Dashboard
At the top of each visualization:
- **Total Spending** - Large, prominent display with currency formatting
- **Transactions** - Total count of all transactions
- **Categories** - Number of spending categories

### Interactive Pie Chart
- **Recharts PieChart** with:
  - Smooth entrance animation (800ms)
  - Percentage labels on slices (only shown if >5%)
  - Custom color palette (10 distinct colors)
  - Responsive sizing (adapts to screen width)

- **Interactive Tooltips**
  - Shows category name
  - Formatted amount (e.g., "$1,072.93")
  - Percentage of total
  - White background with subtle shadow
  - Follows cursor

- **Legend**
  - Bottom-aligned
  - Shows category name and amount
  - Color-coded dots match pie slices

### Category Breakdown Section
Detailed list showing each category:

- **Category Header**
  - Color dot (matches pie chart)
  - Category name
  - Total amount (right-aligned)

- **Progress Bar**
  - Visual representation of spending percentage
  - Color matches pie chart
  - Smooth width animation on load
  - Full width represents 100% of total spending

- **Category Details**
  - Percentage (indigo colored)
  - Transaction count (gray)

- **Hover Effect**
  - Light gray background
  - Slides right slightly
  - Smooth transition

### Empty State
When no file is selected:
- Large pie chart icon
- "No data to visualize" message
- Helpful subtitle: "Upload a file to see your spending analysis"

## 🌓 Dark Mode Support

All components automatically adapt to system dark mode preferences:

### Light Mode (Default)
- White backgrounds
- Gray borders
- Dark text on light backgrounds
- Subtle shadows

### Dark Mode
- Dark gray backgrounds (#1f2937, #111827)
- Lighter borders
- Light text on dark backgrounds
- Adjusted shadows for dark theme
- Purple gradient header becomes deeper purple

## 📱 Responsive Design

### Desktop (>1024px)
- Full-width layout with max-width: 1200px
- Side-by-side summary statistics
- Large chart (400px height)
- All features fully visible

### Tablet (640px - 1024px)
- Stacked summary statistics
- Medium chart size
- Adjusted padding
- All features maintained

### Mobile (<640px)
- Single column layout
- Smaller typography
- Compact spacing
- Touch-friendly targets (44px minimum)
- Charts scale down appropriately
- File metadata may wrap

## ♿ Accessibility Features

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows logical flow
- Enter/Space activates buttons and file selection
- Escape closes modals (if implemented)

### Screen Reader Support
- Semantic HTML (header, main, section, footer)
- ARIA labels on all icons
- Alt text for visual elements
- Status announcements for file uploads
- Descriptive button labels

### Visual Accessibility
- **Color Contrast**: Meets WCAG AA standards
- **Focus Indicators**: 2px indigo outline on focus
- **No Color-Only Information**: Status shown with icons + text
- **Large Touch Targets**: Minimum 44x44px on mobile
- **Readable Fonts**: System fonts, minimum 14px

### Motion & Animation
- Respects `prefers-reduced-motion`
- All animations can be disabled via system settings
- Instant transitions when motion is reduced

## 🎯 User Experience Flow

### 1. Initial State
User sees:
- Beautiful header
- Empty upload zone with clear instructions
- No files in list
- Empty state in visualization

### 2. Upload File
- User drags CSV file or clicks to browse
- Upload zone shows "Uploading..." with spinner
- File appears in list with "Uploading..." status
- Spinner animates to show progress

### 3. Processing Complete
- File status changes to "Ready" with green badge
- File is automatically selected (indigo highlight)
- Visualization section populates with:
  - Summary statistics
  - Animated pie chart
  - Category breakdown

### 4. View Different Files
- User clicks another file in the list
- Previous file deselects
- New file highlights
- Visualization smoothly transitions to new data

### 5. Remove File
- User hovers over file
- X button appears
- Click to remove
- File removed from list
- If it was selected, visualization shows empty state

## 🎁 Bonus Features

### Smooth Animations
- Upload zone: Scale on drag, icon lift on hover
- File list: Lift on hover, slide on select
- Charts: Entrance animation, smooth transitions
- Buttons: Color transition on hover

### Currency Formatting
- Automatic locale-aware formatting
- Shows 2 decimal places
- Dollar sign prefix
- Comma separators for thousands

### File Size Formatting
- Automatic unit conversion (B, KB, MB)
- 1 decimal place for precision
- Human-readable format

### Date Formatting
- Locale-aware date display
- Shows: "Month Day, Year at HH:MM AM/PM"
- Example: "Dec 30, 2025 at 1:30 PM"

### Color Coding
- 10 distinct, accessible colors
- Consistent across pie chart and breakdown
- Colorblind-friendly palette
- High contrast ratios

## 🔮 Future Enhancement Ideas

### Analytics
- Spending trends over time (line chart)
- Month-over-month comparison
- Top merchants by spending
- Average transaction amount
- Spending velocity (transactions per day)

### Filtering & Search
- Filter by date range
- Search by merchant name
- Filter by amount (min/max)
- Category filtering

### Export Options
- Download chart as PNG
- Export data as CSV
- Generate PDF report
- Share via link

### Customization
- User-defined categories
- Custom color schemes
- Budget goals per category
- Spending alerts

### Multiple File Analysis
- Compare multiple months
- Merge multiple statements
- Year-over-year comparison
- Running totals

### Advanced Visualizations
- Heatmap calendar (spending by day)
- Sankey diagram (money flow)
- Treemap (hierarchical spending)
- Time series with trends

---

**Try it now at http://localhost:5173/** 🚀