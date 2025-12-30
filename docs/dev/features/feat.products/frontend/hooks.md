# Products Hooks

## Purpose
Custom React hooks for state management and data operations related to products.

## File Location
`frontend/src/hooks/useProducts.js`

## useProducts Hook

Main hook for managing product state and operations.

### State Variables

```javascript
// Component state
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
const [showForm, setShowForm] = useState<boolean>(false);
const [isEditing, setIsEditing] = useState<boolean>(false);
const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
const [pagination, setPagination] = useState<PaginationState>({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
});

// Types
type Product = {
  product_id: number,
  name: string,
  category: string,
  description: string | null,
  unit: string,
  rate: number,
  rate_unit: string,
  image_data: string | null,
  image_mime_type: string | null,
  min_stock_level: number,
  max_stock_level: number,
  total_stock: number,
  supplier: string | null,
  created_at: string
}

type PaginationState = {
  page: number,
  limit: number,
  total: number,
  pages: number
}
```

### Returned Object

```javascript
return {
  // State
  products: Product[],
  loading: boolean,
  error: string | null,
  showForm: boolean,
  isEditing: boolean,
  currentProduct: Product | null,
  pagination: PaginationState,
  
  // Setters
  setError: (error: string | null) => void,
  setShowForm: (show: boolean) => void,
  setIsEditing: (editing: boolean) => void,
  setCurrentProduct: (product: Product | null) => void,
  
  // Methods
  loadProducts: (page?: number, limit?: number, search?: string) => Promise<void>,
  deleteProduct: (productId: number) => Promise<void>,
  handlePageChange: (newPage: number) => void,
  handlePageSizeChange: (newSize: number) => void
}
```

---

## Hook Methods

### loadProducts(page, limit, search)

Fetches products from the API with pagination and optional search.

**Input Data Types:**
```javascript
page: number | undefined = 1       // Page number (1-based)
limit: number | undefined = 10     // Items per page
search: string | undefined = ""    // Search query
```

**Process Flow:**
```
setLoading(true)
  ↓
productsHandlers.fetchProducts(page, limit, search)
  ↓
API Response:
{
  success: boolean,
  data: Product[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
  ↓
setProducts(data)
setPagination(pagination)
setError(null)
  ↓
setLoading(false)
```

**Error Handling:**
```javascript
try {
  // API call
} catch (err) {
  setError(err.message || 'Failed to load products')
  setLoading(false)
}
```

---

### createProduct(formData)

Creates a new product.

**Input Data Types:**
```javascript
formData = {
  name: string,
  category: string,
  description: string | null,
  unit: string,
  rate: number,
  rate_unit: string,
  min_stock_level: number,
  max_stock_level: number,
  image: File | null
}
```

**Process Flow:**
```
Convert to FormData (for file upload)
  ↓
productsHandlers.createProduct(formData)
  ↓
productsAPI.create(formData)
  ↓
POST /api/products
  ↓
Success Response:
{
  success: boolean,
  data: {
    product_id: number,
    name: string,
    ...
  }
}
  ↓
loadProducts(1, pagination.limit)  // Reload from first page
setShowForm(false)
showToast('Product created successfully')
  ↓
Error: setError(message), showToast(error)
```

**Return Type:**
```javascript
Promise<Product | null>
```

---

### updateProduct(productId, formData)

Updates an existing product.

**Input Data Types:**
```javascript
productId: number

formData = {
  name: string | undefined,
  category: string | undefined,
  description: string | null | undefined,
  unit: string | undefined,
  rate: number | undefined,
  rate_unit: string | undefined,
  min_stock_level: number | undefined,
  max_stock_level: number | undefined,
  image: File | null | undefined
}
```

**Process Flow:**
```
Convert to FormData
  ↓
productsHandlers.updateProduct(productId, formData)
  ↓
productsAPI.update(productId, formData)
  ↓
PUT /api/products/{productId}
  ↓
Success Response:
{
  success: boolean,
  data: Product  // Updated product
}
  ↓
loadProducts(pagination.page, pagination.limit)  // Reload current page
setShowForm(false)
setIsEditing(false)
showToast('Product updated successfully')
  ↓
Error: setError(message), showToast(error)
```

---

### deleteProduct(productId)

Deletes a product after confirmation.

**Input Data Types:**
```javascript
productId: number
```

**Process Flow:**
```
(Assume confirmation already shown in component)
  ↓
productsHandlers.deleteProduct(productId)
  ↓
productsAPI.delete(productId)
  ↓
DELETE /api/products/{productId}
  ↓
Success Response:
{
  success: boolean,
  data: {
    product_id: number,
    deleted: boolean
  }
}
  ↓
Remove from products array
setProducts(products.filter(p => p.product_id !== productId))
  ↓
Update pagination.total
  ↓
showToast('Product deleted successfully')
  ↓
Error: setError(message), showToast(error)
```

---

### handlePageChange(newPage)

Changes the current page and reloads products.

**Input Data Types:**
```javascript
newPage: number  // Page number (1-based)
```

**Process Flow:**
```
Validate: 1 <= newPage <= pagination.pages
  ↓
loadProducts(newPage, pagination.limit, search)
  ↓
setPagination({ ...pagination, page: newPage })
  ↓
Scroll to top of table
```

---

### handlePageSizeChange(newSize)

Changes items per page.

**Input Data Types:**
```javascript
newSize: number  // Items per page (usually 10, 25, 50, 100)
```

**Process Flow:**
```
Validate: 1 <= newSize <= MAX_LIMIT
  ↓
loadProducts(1, newSize, search)  // Reset to page 1
  ↓
setPagination({ ...pagination, page: 1, limit: newSize })
```

---

## useEffect Hooks

### Initial Load
```javascript
useEffect(() => {
  if (!hasInitialLoaded.current) {
    loadProducts();
    hasInitialLoaded.current = true;
  }
}, []);
```

### Search Debouncing
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    if (search.value) {
      loadProducts(1, pagination.limit, search.value);
    } else {
      loadProducts(1, pagination.limit);
    }
  }, 500);  // 500ms debounce

  return () => clearTimeout(timer);
}, [search.value]);
```

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
  image_data: string | null;       // Base64
  image_mime_type: string | null;
  min_stock_level: number;
  max_stock_level: number;
  total_stock: number;
  supplier: string | null;
  created_at: string | Date;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  showForm: boolean;
  isEditing: boolean;
  currentProduct: Product | null;
  pagination: PaginationState;
  setError: (error: string | null) => void;
  setShowForm: (show: boolean) => void;
  setIsEditing: (editing: boolean) => void;
  setCurrentProduct: (product: Product | null) => void;
  loadProducts: (page?: number, limit?: number, search?: string) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  handlePageChange: (newPage: number) => void;
  handlePageSizeChange: (newSize: number) => void;
}
```

---

## Dependencies
- `handlers/productsHandlers.js` - Business logic
- `react` - useState, useEffect, useRef
- `react-toastify` - Toast notifications
