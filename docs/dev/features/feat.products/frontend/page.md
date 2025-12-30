# Products Page

## Purpose
Main UI component for products management. Displays product list with pagination, search, and CRUD operations.

## File Location
`frontend/src/pages/Products/ProductsPage.jsx`

## Component State

```javascript
// State managed by useProducts hook
{
  products: Product[],              // Current page of products
  loading: boolean,                 // Fetching in progress
  error: string | null,             // Error message if any
  showForm: boolean,                // Show/hide form modal
  isEditing: boolean,               // Edit vs create mode
  currentProduct: Product | null,   // Product being edited
  
  pagination: {
    page: number,                   // Current page (1-based)
    limit: number,                  // Items per page
    total: number,                  // Total products
    pages: number                   // Total pages
  },
  
  // Functions to manage state
  setError: (error: string | null) => void,
  setShowForm: (show: boolean) => void,
  setIsEditing: (editing: boolean) => void,
  setCurrentProduct: (product: Product | null) => void,
  loadProducts: (page?: number, limit?: number, search?: string) => Promise<void>,
  deleteProduct: (productId: number) => Promise<void>,
  handlePageChange: (newPage: number) => void,
  handlePageSizeChange: (newSize: number) => void
}

// Product object type
Product = {
  product_id: number,
  name: string,
  category: string,
  description: string | null,
  unit: string,
  rate: number,
  rate_unit: string,
  image_data: string | null,        // Base64 encoded
  image_mime_type: string | null,
  min_stock_level: number,
  max_stock_level: number,
  total_stock: number,
  supplier: string | null,
  created_at: string | Date
}
```

## Props

None - this is a top-level page component.

## Key Sub-components

### DataTable
```javascript
<DataTable
  data={products}              // Product[]
  columns={productsConfig.columns}
  loading={loading}
  onDelete={handleDelete}
  onEdit={handleEdit}
/>
```

### ProductForm
```javascript
<ProductForm
  product={currentProduct}    // Product | null
  onSubmit={handleFormSubmit}
  isEditing={isEditing}
/>
```

---

## User Interactions

### Load Products
Triggered on component mount and when filters change.

**Data Flow:**
```
Initial load
  ↓
useProducts.loadProducts()
  ↓
productsHandlers.fetchProducts(page, limit, search)
  ↓
productsAPI.getAll(page, limit, search)
  ↓
GET /api/products?page=1&limit=10&search=""
  ↓
Set products state
  ↓
Render DataTable
```

### Search Products
User enters search term and hits enter.

**Data Flow:**
```
User input: "laptop"
  ↓
search.handleSearch("laptop")
  ↓
Call loadProducts(1, limit, "laptop")
  ↓
API call with search parameter
  ↓
Results filtered on server
  ↓
Re-render with filtered results
```

### Create Product
User clicks "Add Product" button.

**Data Flow:**
```
Click "Add Product"
  ↓
setShowForm(true)
  ↓
setCurrentProduct(null)
  ↓
setIsEditing(false)
  ↓
Show ProductForm modal
  ↓
User fills form and submits
  ↓
productsHandlers.createProduct(formData)
  ↓
POST /api/products
  ↓
Success: reload products, close form, show toast
  ↓
Error: show error message
```

### Update Product
User clicks edit icon on product row.

**Data Flow:**
```
Click edit on row
  ↓
handleEdit(product)
  ↓
setCurrentProduct(product)
  ↓
setIsEditing(true)
  ↓
setShowForm(true)
  ↓
Show ProductForm with pre-filled data
  ↓
User modifies and submits
  ↓
productsHandlers.updateProduct(productId, formData)
  ↓
PUT /api/products/{id}
  ↓
Success: reload products, close form, show toast
```

### Delete Product
User confirms delete from modal.

**Data Flow:**
```
Click delete button
  ↓
Show confirmation modal
  ↓
User confirms
  ↓
deleteProduct(productId)
  ↓
DELETE /api/products/{id}
  ↓
Success: remove from list, show toast
  ↓
Error: show error modal
```

### Export Products
User clicks export button.

**Data Flow:**
```
Click "Export CSV" or "Export PDF"
  ↓
Determine scope (current page vs all)
  ↓
Call exportToCSV(products) or exportToPDF(products)
  ↓
Generate file using papaparse (CSV) or jsPDF (PDF)
  ↓
Download file to user's device
```

---

## Event Handlers

### handleFormSubmit(formData)
```javascript
// Input from ProductForm
formData = {
  name: string,
  category: string,
  description: string | null,
  unit: string,
  rate: number,
  rate_unit: string,
  min_stock_level: number,
  max_stock_level: number,
  image: File | null      // From file input
}

// Processing
if (isEditing) {
  await updateProduct(currentProduct.product_id, formData)
} else {
  await createProduct(formData)
}
```

### handlePageChange(newPage)
```javascript
// Input
newPage: number           // New page number (1-based)

// Processing
setShowForm(false)
setCurrentProduct(null)
loadProducts(newPage, pagination.limit, search.value)
```

### handleDelete(productId)
```javascript
// Input
productId: number

// Processing
showConfirmModal("Delete product?")
  ↓ (on confirm)
deleteProduct(productId)
```

---

## Hooks Used

### useProducts()
```javascript
const {
  products,
  loading,
  error,
  showForm,
  isEditing,
  currentProduct,
  pagination,
  setError,
  setShowForm,
  setIsEditing,
  setCurrentProduct,
  loadProducts,
  deleteProduct,
  handlePageChange,
  handlePageSizeChange
} = useProducts();
```

### useTableSearch(initialValue)
```javascript
const search = useTableSearch('');

// Returns
{
  value: string,                                  // Current search value
  handleSearch: (term: string) => void,
  clear: () => void
}
```

### useActiveNavItem()
```javascript
// Highlights "Products" in navigation
const activeItem = useActiveNavItem();
```

---

## Styling

```javascript
// Module import
import styles from './ProductsPage.module.css';

// Usage
<div className={styles.container}>
  <div className={styles.toolbar}>
    <Button className={styles.addBtn} />
  </div>
  <div className={styles.tableWrapper}>
    <DataTable />
  </div>
</div>
```

---

## Dependencies
- `hooks/useProducts.js` - State management
- `hooks/useTableSearch.js` - Search functionality
- `hooks/useActiveNavItem.js` - Navigation state
- `handlers/productsHandlers.js` - Business logic
- `components/DataTable.jsx` - Display table
- `components/ProductForm.jsx` - Form modal
- `utils/export.js` - CSV/PDF export
- `react-toastify` - Toast notifications
- `react-icons` - Icons
