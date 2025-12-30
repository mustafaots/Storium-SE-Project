# Products Components

## Purpose
Reusable React components for the Products feature UI.

## File Location
`frontend/src/components/Products/`

---

## ProductForm Component

Modal/form for creating and editing products.

**File:** `ProductForm.jsx`

### Props

```typescript
interface ProductFormProps {
  product: Product | null;           // null for create, Product object for edit
  onSubmit: (formData: FormInput) => Promise<void>;
  isEditing: boolean;
  onCancel?: () => void;
}

interface FormInput {
  name: string;
  category: string;
  description: string | null;
  unit: string;
  rate: number | string;
  rate_unit: string;
  min_stock_level: number | string;
  max_stock_level: number | string;
  image: File | null;
}

interface Product {
  product_id: number;
  name: string;
  category: string;
  description: string | null;
  unit: string;
  rate: number;
  rate_unit: string;
  image_data: string | null;
  image_mime_type: string | null;
  min_stock_level: number;
  max_stock_level: number;
  total_stock: number;
  supplier: string | null;
  created_at: string;
}
```

### Internal State

```javascript
{
  formData: FormInput,
  loading: boolean,
  errors: {
    [field: string]: string
  },
  previewImage: string | null  // Base64 preview
}
```

### Form Fields

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| name | string | 2-100 chars, no special chars | ✓ |
| category | string | from predefined list | ✓ |
| description | string \| null | 0-500 chars | ✗ |
| unit | string | from predefined list | ✓ |
| rate | number | >= 0, max 2 decimals | ✓ |
| rate_unit | string | "per unit", "per kg", etc | ✓ |
| min_stock_level | number | >= 0, integer | ✓ |
| max_stock_level | number | > min_stock_level | ✓ |
| image | File \| null | .jpg/.png/.gif/.webp, < 5MB | ✗ |

### Features

- **Pre-fill:** If `product` prop provided, fills form with existing data
- **Image Preview:** Shows preview of selected/current image
- **Validation:** Client-side validation with error messages below each field
- **Loading State:** Disables submit button and shows spinner during API call
- **Image Upload:** File input with drag-and-drop support
- **Categories:** Dropdown with predefined categories from backend

### User Interactions

**Create Product:**
```
Click "Add Product" button
  ↓
ProductForm mounts with product={null}, isEditing={false}
  ↓
User fills form and clicks "Save"
  ↓
Validate all fields
  ↓
Create FormData with fields + image file
  ↓
Call onSubmit(formData)
  ↓
API sends POST /api/products
  ↓
Component shows loading spinner
  ↓
Success: Close form, clear state
  ↓
Error: Show error toast, keep form open
```

**Edit Product:**
```
Click edit icon on row
  ↓
ProductForm mounts with product={existingProduct}, isEditing={true}
  ↓
Form pre-fills with product data
  ↓
Show image preview from product.image_data
  ↓
User modifies fields and clicks "Update"
  ↓
Validate changed fields only
  ↓
Create FormData with only changed fields
  ↓
Call onSubmit(formData)
  ↓
API sends PUT /api/products/{id}
  ↓
Success: Close form, reload products list
```

### Styling

```css
.form-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

.error-message {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
}

.image-preview {
  width: 100%;
  max-width: 300px;
  border-radius: 4px;
  margin-top: 8px;
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
}
```

### Dependencies
- `react` - Hooks: useState, useEffect, useCallback
- `react-toastify` - Error notifications
- `react-icons` - Icons (file upload, close, etc)

---

## DataTable Component

Displays products in a sortable, paginated table.

**File:** `DataTable.jsx`

### Props

```typescript
interface DataTableProps {
  data: Product[];
  columns: ColumnConfig[];
  loading: boolean;
  onDelete: (id: number) => void;
  onEdit: (product: Product) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}

interface ColumnConfig {
  key: string;           // product_id, name, category, rate, etc
  label: string;         // Display name
  width: string;         // CSS width: "150px", "20%", etc
  sortable: boolean;
  formatter?: (value: any, row: Product) => React.ReactNode;
  alignment: 'left' | 'center' | 'right';
}

interface Product {
  product_id: number;
  name: string;
  category: string;
  description: string | null;
  unit: string;
  rate: number;
  rate_unit: string;
  image_data: string | null;
  image_mime_type: string | null;
  min_stock_level: number;
  max_stock_level: number;
  total_stock: number;
  supplier: string | null;
  created_at: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
```

### Internal State

```javascript
{
  sortField: string | null,
  sortDirection: 'asc' | 'desc',
  selectedRows: Set<number>  // For bulk operations
}
```

### Features

- **Sortable Columns:** Click column header to sort (if sortable=true)
- **Pagination Controls:** Page navigation and page size selector
- **Row Actions:** Edit and delete buttons per row
- **Loading State:** Shows skeleton loader while fetching
- **Empty State:** Shows "No products found" message
- **Column Formatting:** Custom formatters for special columns (image, dates, numbers)
- **Row Hovering:** Highlight row on hover
- **Bulk Selection:** Checkbox column for multi-select operations

### Column Configuration Example

```javascript
const columnsConfig = [
  {
    key: 'product_id',
    label: 'ID',
    width: '80px',
    sortable: true,
    alignment: 'center'
  },
  {
    key: 'name',
    label: 'Product Name',
    width: '200px',
    sortable: true,
    alignment: 'left'
  },
  {
    key: 'category',
    label: 'Category',
    width: '150px',
    sortable: true,
    alignment: 'left'
  },
  {
    key: 'rate',
    label: 'Price',
    width: '120px',
    sortable: true,
    formatter: (value) => `$${value.toFixed(2)}`,
    alignment: 'right'
  },
  {
    key: 'total_stock',
    label: 'Stock',
    width: '100px',
    sortable: true,
    formatter: (value, row) => {
      const isLow = value < row.min_stock_level;
      return <span style={{color: isLow ? '#d32f2f' : '#4caf50'}}>
        {value}
      </span>;
    },
    alignment: 'center'
  },
  {
    key: 'image_data',
    label: 'Image',
    width: '80px',
    sortable: false,
    formatter: (value, row) => value ? 
      <img src={`data:${row.image_mime_type};base64,${value}`} style={{maxWidth: '60px'}} /> : 
      <span>No image</span>,
    alignment: 'center'
  }
]
```

### User Interactions

**Sort:**
```
Click on sortable column header
  ↓
Toggle sort direction (asc ↔ desc)
  ↓
Call onSort(fieldName, direction)
  ↓
Backend re-fetches sorted data
  ↓
Table updates with new rows
```

**Paginate:**
```
Click page number or next/prev
  ↓
Call onPageChange(newPage)
  ↓
Fetch products for new page
  ↓
Table scrolls to top and updates rows
```

**Edit Row:**
```
Click edit icon on row
  ↓
Call onEdit(product)
  ↓
Parent component opens ProductForm
```

**Delete Row:**
```
Click delete icon on row
  ↓
Show confirmation modal
  ↓
User confirms
  ↓
Call onDelete(productId)
  ↓
Row removed from table
  ↓
Update pagination if needed
```

### Styling

```css
.table-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table thead {
  background: #f5f5f5;
  border-bottom: 2px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.table th:hover {
  background: #eeeeee;
}

.table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s;
}

.table tbody tr:hover {
  background: #f9f9f9;
}

.table td {
  padding: 12px 16px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}

.edit-button {
  background: #2196f3;
  color: white;
}

.edit-button:hover {
  background: #1976d2;
}

.delete-button {
  background: #f44336;
  color: white;
}

.delete-button:hover {
  background: #da190b;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.pagination-controls button {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.pagination-controls button:hover:not(:disabled) {
  background: #f5f5f5;
}

.pagination-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Dependencies
- `react` - Hooks: useState, useCallback, useMemo
- `react-icons` - Icons (sort, edit, delete, etc)

---

## SearchBar Component

Input field for searching products.

**File:** `SearchBar.jsx`

### Props

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;  // Default: 500
}
```

### Features
- Debounced search input
- Clear button when text present
- Real-time search as user types
- Keyboard: Enter to search, Escape to clear

---

## FilterPanel Component

Filters products by category, stock level, price range.

**File:** `FilterPanel.jsx`

### Props

```typescript
interface FilterPanelProps {
  categories: string[];
  onFilter: (filters: FilterConfig) => void;
}

interface FilterConfig {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean | null;
  lowStock: boolean | null;
}
```

---

## ExportButton Component

Exports products to CSV or PDF.

**File:** `ExportButton.jsx`

### Props

```typescript
interface ExportButtonProps {
  products: Product[];
  fileName?: string;  // Default: "products"
  format: 'csv' | 'pdf';
}
```

### Features
- Exports current page or all products
- CSV using PapaParse
- PDF using jsPDF
- Maintains data integrity (Base64 images not included in exports)

---

## Type Definitions

```typescript
interface Product {
  product_id: number;
  name: string;
  category: string;
  description: string | null;
  unit: string;
  rate: number;
  rate_unit: string;
  image_data: string | null;
  image_mime_type: string | null;
  min_stock_level: number;
  max_stock_level: number;
  total_stock: number;
  supplier: string | null;
  created_at: string;
}

interface ColumnConfig {
  key: string;
  label: string;
  width: string;
  sortable: boolean;
  formatter?: (value: any, row: Product) => React.ReactNode;
  alignment: 'left' | 'center' | 'right';
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface FormInput {
  name: string;
  category: string;
  description: string | null;
  unit: string;
  rate: number | string;
  rate_unit: string;
  min_stock_level: number | string;
  max_stock_level: number | string;
  image: File | null;
}
```

---

## Dependencies
- `react` - Core library
- `react-icons` - Icon components
- `react-toastify` - Notifications
- `papaparse` - CSV export
- `jspdf` - PDF export
