# Layout Guide - Visual Comparison

## Mobile Layout (< 1200px)

```
┌─────────────────────────────────────┐
│         💳 Header (Sticky)          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│                                     │
│        📤 File Upload               │
│                                     │
└─────────────────────────────────────┘
           ⬇️ (scrollable)
┌─────────────────────────────────────┐
│        📋 File List                 │
│  ┌───────────────────────────────┐  │
│  │ 📄 file1.csv        [Ready]   │  │
│  │ 📄 file2.csv        [Ready]   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           ⬇️ (scrollable)
┌─────────────────────────────────────┐
│      📊 Data Visualization          │
│                                     │
│     [Spending Analysis Stats]       │
│     ┌─────────────────────┐         │
│     │                     │         │
│     │   📈 Pie Chart      │         │
│     │                     │         │
│     └─────────────────────┘         │
│                                     │
│     [Category Breakdown Bars]       │
└─────────────────────────────────────┘
           ⬇️ (scrollable)
┌─────────────────────────────────────┐
│      📝 Transactions List           │
│                                     │
│  ▶ Gas             $64.04           │
│  ▼ Restaurants     $1,072.93        │
│    ┌─────────────────────────────┐  │
│    │ Transaction Table           │  │
│    │ [Cards on mobile]           │  │
│    └─────────────────────────────┘  │
│  ▶ Groceries       $501.20          │
└─────────────────────────────────────┘
           ⬇️ (scrollable)
┌─────────────────────────────────────┐
│            Footer                   │
└─────────────────────────────────────┘
```

**Characteristics:**
- Single column, full width
- Everything stacks vertically
- Entire page scrolls
- Touch-optimized controls
- Card-based transaction layout

---

## Desktop Layout (≥ 1200px)

```
┌─────────────────────────────────────────────────────────────────┐
│                   💳 Header (Sticky)                            │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────┬─────────────────────────────────────────────┐
│   LEFT COLUMN     │          RIGHT COLUMN                       │
│   (Sticky 400px)  │          (Flexible Width)                   │
│                   │                                             │
│ ┌───────────────┐ │ ┌─────────────────────────────────────────┐ │
│ │               │ │ │    📊 Data Visualization                │ │
│ │ 📤 Upload     │ │ │                                         │ │
│ │               │ │ │  [Spending Analysis Stats]              │ │
│ │               │ │ │  ┌──────────────────────────────┐       │ │
│ └───────────────┘ │ │  │                              │       │ │
│                   │ │  │      📈 Pie Chart            │       │ │
│ ┌───────────────┐ │ │  │                              │       │ │
│ │ 📋 File List  │ │ │  └──────────────────────────────┘       │ │
│ │ ┌───────────┐ │ │ │                                         │ │
│ │ │ file1.csv │ │ │ │  [Category Breakdown Bars]              │ │
│ │ └───────────┘ │ │ └─────────────────────────────────────────┘ │
│ │ ┌───────────┐ │ │            ⬇️ (scrollable)                  │
│ │ │ file2.csv │ │ │ ┌─────────────────────────────────────────┐ │
│ │ └───────────┘ │ │ │    📝 Transactions List                 │ │
│ └───────────────┘ │ │ │                                         │ │
│                   │ │ │  [Expand All] [Collapse All]            │ │
│  (Scrollable if   │ │ │                                         │ │
│   many files)     │ │ │  ▶ Gas                  $64.04          │ │
│                   │ │ │                                         │ │
│  ⬆️ STAYS IN VIEW │ │ │  ▼ Restaurants          $1,072.93       │ │
│                   │ │ │  ┌─────────────────────────────────┐   │ │
│                   │ │ │  │ Date     Merchant      Amount   │   │ │
│                   │ │ │  │ Dec 4    Uber Eats     $53.40   │   │ │
│                   │ │ │  │ Dec 7    Browns        $124.20  │   │ │
│                   │ │ │  │          Total:        $1,072.93│   │ │
│                   │ │ │  └─────────────────────────────────┘   │ │
│                   │ │ │                                         │ │
│                   │ │ │  ▶ Groceries            $501.20         │ │
│                   │ │ │  ▶ Entertainment        $367.28         │ │
│                   │ │ └─────────────────────────────────────────┘ │
│                   │ │                                             │
└───────────────────┴─────────────────────────────────────────────┘
                    
┌─────────────────────────────────────────────────────────────────┐
│                            Footer                               │
└─────────────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Two-column layout
- Left column (400px) sticks to viewport
- Right column scrolls independently
- More efficient use of screen space
- Traditional table layout for transactions
- Easy access to file upload/selection while viewing data

---

## Screen Size Breakpoints

### Mobile Small (< 640px)
- **Upload**: Compact padding, smaller icons
- **File List**: Card-style items with wrapping text
- **Charts**: Full width, height: 350px
- **Transactions**: Card-based layout, hidden table headers

### Tablet (640px - 1199px)
- **Upload**: Standard padding, full-size icons
- **File List**: Standard items with metadata
- **Charts**: Full width, height: 400px
- **Transactions**: Table layout with all columns

### Desktop (1200px - 1399px)
- **Left Column**: 400px fixed, sticky position
- **Right Column**: Flexible width (fills remaining space)
- **Upload**: Compact for column, smaller icons (48px)
- **Charts**: Full width of right column, height: 400px

### Desktop XL (≥ 1400px)
- **Left Column**: 450px fixed
- **Right Column**: More spacious
- **Container**: Max-width 1400px, centered
- **Charts**: Larger, more detailed

---

## Component Dimensions

### Mobile (< 640px)
```
FileUpload:      100% width, 2rem padding
FileList:        100% width, compact items
Visualization:   100% width, 350px chart height
Transactions:    100% width, card layout
```

### Tablet (640px - 1199px)
```
FileUpload:      100% width, 3rem padding
FileList:        100% width, full items
Visualization:   100% width, 400px chart height
Transactions:    100% width, table layout
```

### Desktop (≥ 1200px)
```
Left Column:     400px fixed (450px @ 1400px+)
  FileUpload:    100% of column, 1.5rem padding
  FileList:      100% of column, scrollable

Right Column:    Flexible (remaining space)
  Visualization: 100% of column, 400px chart height
  Transactions:  100% of column, expandable tables
```

---

## Interaction Patterns

### Mobile
1. **Tap** to upload file
2. **Scroll down** to see file list
3. **Tap** file to select
4. **Scroll down** to see visualization
5. **Scroll down** to see transactions
6. **Tap** category to expand
7. **Scroll** through transaction cards

### Desktop
1. **Click or drag** file to upload (left column)
2. **Click** file from list (left column - always visible)
3. **View** visualization immediately (right column)
4. **Scroll** right column to see transactions
5. **Click** category to expand
6. **View** transaction table
7. **Left column stays fixed** for easy file switching

---

## Sticky Elements

### All Screens
- **Header**: Sticks to top of viewport
  - Position: `top: 0`
  - Z-index: 100

### Desktop Only (≥ 1200px)
- **Left Column**: Sticks below header
  - Position: `top: calc(120px + 2rem)`
  - Z-index: auto
  - Max-height: `calc(100vh - 120px - 4rem)`
  - Overflow: auto (scrollable if needed)

---

## Scroll Behavior

### Mobile/Tablet (< 1200px)
```
┌─────────────┐
│   Header    │ ← Always visible (sticky)
├─────────────┤
│   Upload    │ ↕️
│   Files     │ ↕️
│   Chart     │ ↕️ Single scroll context
│   Trans.    │ ↕️
│   ...       │ ↕️
└─────────────┘
```

### Desktop (≥ 1200px)
```
┌────────────┬──────────────┐
│  Header    │    Header    │ ← Always visible
├────────────┼──────────────┤
│  Upload    │   Chart      │
│  Files     │   ↕️         │
│            │   Trans.     │ ← Right scrolls
│  ↕️ (if    │   ↕️         │    independently
│   needed)  │   ...        │
│            │   ↕️         │
└────────────┴──────────────┘
     ↑
  Stays fixed
```

---

## Responsive Typography

| Element              | Mobile  | Tablet  | Desktop |
|---------------------|---------|---------|---------|
| Header H1           | 1.75rem | 2rem    | 2.5rem  |
| Section H2          | 1.25rem | 1.375rem| 1.5rem  |
| Section H3          | 1.125rem| 1.25rem | 1.25rem |
| Body Text           | 0.875rem| 0.875rem| 0.875rem|
| Upload Primary      | 1rem    | 1.125rem| 0.9375rem|
| Upload Secondary    | 0.8rem  | 0.875rem| 0.75rem |
| Stat Value          | 1.25rem | 1.5rem  | 1.5rem  |
| Category Toggle     | 0.875rem| 1rem    | 1rem    |
| Transaction Amount  | 0.875rem| 0.875rem| 0.875rem|

---

## Color Scheme

### Light Mode
```
Background:      #f3f4f6 (gray-100)
Cards:           #ffffff (white)
Borders:         #e5e7eb (gray-200)
Text Primary:    #1f2937 (gray-800)
Text Secondary:  #6b7280 (gray-500)
Primary:         #6366f1 (indigo)
Success:         #10b981 (green)
Error:           #ef4444 (red)
```

### Dark Mode
```
Background:      #111827 (gray-900)
Cards:           #1f2937 (gray-800)
Borders:         #374151 (gray-700)
Text Primary:    #f9fafb (gray-50)
Text Secondary:  #d1d5db (gray-300)
Primary:         #818cf8 (indigo-400)
Success:         #34d399 (green-400)
Error:           #f87171 (red-400)
```

---

## Animation Timings

| Animation           | Duration | Easing        |
|--------------------|----------|---------------|
| Layout Transition   | 300ms    | ease          |
| Hover Effects       | 200ms    | ease          |
| Chevron Rotation    | 200ms    | ease          |
| Table Slide Down    | 300ms    | ease          |
| Chart Entrance      | 800ms    | ease          |
| Progress Bar Fill   | 800ms    | ease          |

All animations respect `prefers-reduced-motion: reduce`

---

## Z-Index Stack

```
Layer 5: Header                  z-index: 100
Layer 4: Tooltips               z-index: 50 (Recharts)
Layer 3: Modals                 z-index: 40 (future)
Layer 2: Dropdowns              z-index: 30 (future)
Layer 1: Content                z-index: auto
Layer 0: Background             z-index: auto
```

---

## Mobile App Considerations

### PWA Viewport
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

### Safe Area Insets (iOS)
```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

### Touch Targets
- Minimum: 44px × 44px
- Upload zone: Full width, generous padding
- File list items: Full width, 48px+ height
- Category toggles: Full width, 48px+ height
- Action buttons: 44px+ height

### Gestures
- Swipe to delete files (future)
- Pull to refresh (future)
- Pinch to zoom charts (future)

---

## Performance Metrics

### Layout Shifts (CLS)
- Target: < 0.1
- Sticky elements use fixed heights
- Images have defined dimensions
- No dynamic content insertion above fold

### First Paint
- Header renders immediately
- File upload visible within 100ms
- Charts lazy load when data available

### Scroll Performance
- CSS transforms for animations (GPU)
- Passive event listeners
- Debounced resize handlers
- Virtualization for long lists (future)

---

## Accessibility

### Keyboard Navigation
```
Tab Order:
1. Upload zone
2. File list items (↑↓ to navigate)
3. Expand All button
4. Category toggles (↑↓ to navigate)
5. Transaction rows (when expanded)
```

### Screen Reader Announcements
- "File uploaded successfully"
- "Category [name] expanded"
- "Showing [count] transactions"
- "Total: [amount]"

### Focus Management
- Visible focus rings (2px solid)
- Focus trap in modals (future)
- Skip to content link (future)

---

## Print Layout

When printing:
- Remove sticky positioning
- Expand all transactions
- Hide action buttons
- Black and white safe colors
- Page breaks avoid splitting tables
- Show full URLs in footer

---

**Last Updated**: March 5, 2026
**Status**: ✅ Production Ready