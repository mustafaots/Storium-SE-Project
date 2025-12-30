# Products Handlers

## Purpose
Business logic layer for product operations. Validates, transforms, and orchestrates API calls.

## File Location
`frontend/src/handlers/productsHandlers.js`

## Handler Methods

### fetchProducts(page, limit, search)

Retrieves products from the backend.

**Input Data Types:**
```javascript
page: number = 1          // Page number (1-based)
limit: number = 10        // Items per page
search: string = ""       // Search term
```

**Internal Processing:**
```javascript
// Validation
const validPage = Math.max(1, parseInt(page) || 1)
const validLimit = Math.min(Math.max(1, parseInt(limit) || 10), 100)
const validSearch = (search || '').trim()

// Build query params
const params = {
  page: validPage,
  limit: validLimit,
  search: validSearch
}
```

**API Call:**
```javascript
productsAPI.getAll(validPage, validLimit, validSearch)
```

**Output Data Types:**
```javascript
{
  products: Product[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}

// Where Product = {...} (see hooks.md)
```

**Error Handling:**
```javascript
try {
  const response = await productsAPI.getAll(...)
  return response.data
} catch (error) {
  throw new Error(error.response?.data?.message || error.message)
}
```

---

### createProduct(formData)

Creates a new product with validation.

**Input Data Types:**
```javascript
formData = {
  name: string,
  category: string,
  description: string | null,
  unit: string,
  rate: number | string,         // Will be parsed to number
  rate_unit: string,
  min_stock_level: number | string,
  max_stock_level: number | string,
  image: File | null             // From file input element
}
```

**Validation Rules:**
```javascript
// Client-side validation before API call
const validate = (formData) => {
  const errors: string[] = []
  
  if (!formData.name?.trim()) {
    errors.push('Product name is required')
  }
  if (!formData.category?.trim()) {
    errors.push('Category is required')
  }
  if (!formData.unit?.trim()) {
    errors.push('Unit is required')
  }
  if (!formData.rate || isNaN(Number(formData.rate))) {
    errors.push('Rate must be a valid number')
  }
  if (formData.rate && Number(formData.rate) < 0) {
    errors.push('Rate cannot be negative')
  }
  if (formData.image && formData.image.size > 5 * 1024 * 1024) {
    errors.push('Image cannot exceed 5MB')
  }
  if (formData.image && !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(formData.image.type)) {
    errors.push('Invalid image format. Allowed: JPEG, PNG, GIF, WebP')
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }
}
```

**Data Transformation:**
```javascript
// Convert to FormData for multipart/form-data
const transformedData = new FormData()
transformedData.append('name', formData.name)
transformedData.append('category', formData.category)
transformedData.append('description', formData.description || '')
transformedData.append('unit', formData.unit)
transformedData.append('rate', parseFloat(formData.rate).toFixed(2))
transformedData.append('rate_unit', formData.rate_unit)
transformedData.append('min_stock_level', formData.min_stock_level || 0)
transformedData.append('max_stock_level', formData.max_stock_level || 1000)
if (formData.image) {
  transformedData.append('image', formData.image)
}
```

**API Call:**
```javascript
productsAPI.create(transformedData)
```

**Output Data Types:**
```javascript
{
  product_id: number,
  name: string,
  category: string,
  unit: string,
  rate: number,
  rate_unit: string,
  created_at: Date
}
```

**Error Handling:**
```javascript
try {
  validate(formData)
  const response = await productsAPI.create(transformedData)
  return response.data
} catch (error) {
  throw new Error(error.response?.data?.message || error.message)
}
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
  rate: number | string | undefined,
  rate_unit: string | undefined,
  min_stock_level: number | string | undefined,
  max_stock_level: number | string | undefined,
  image: File | null | undefined
}
```

**Validation Rules:**
```javascript
// Only validate provided fields
const validate = (formData) => {
  const errors: string[] = []
  
  if (formData.name !== undefined && !formData.name.trim()) {
    errors.push('Product name cannot be empty')
  }
  if (formData.rate !== undefined && isNaN(Number(formData.rate))) {
    errors.push('Rate must be a valid number')
  }
  if (formData.image && formData.image.size > 5 * 1024 * 1024) {
    errors.push('Image cannot exceed 5MB')
  }
  // ... more validations
  
  if (errors.length > 0) throw new Error(errors.join('\n'))
}
```

**Data Transformation:**
```javascript
// Only include fields that were provided
const transformedData = new FormData()

if (formData.name !== undefined) {
  transformedData.append('name', formData.name)
}
if (formData.rate !== undefined) {
  transformedData.append('rate', parseFloat(formData.rate).toFixed(2))
}
// ... etc for other fields
if (formData.image) {
  transformedData.append('image', formData.image)
}
```

**API Call:**
```javascript
productsAPI.update(productId, transformedData)
```

**Output Data Types:**
```javascript
Product  // Updated product (see hooks.md)
```

---

### deleteProduct(productId)

Deletes a product (assume confirmation already shown in component).

**Input Data Types:**
```javascript
productId: number
```

**Validation:**
```javascript
if (!productId || typeof productId !== 'number') {
  throw new Error('Invalid product ID')
}
```

**API Call:**
```javascript
productsAPI.delete(productId)
```

**Output Data Types:**
```javascript
{
  product_id: number,
  deleted: boolean,
  name: string
}
```

---

### searchProducts(query)

Searches products by name, category, or description.

**Input Data Types:**
```javascript
query: string  // Search term
```

**Processing:**
```javascript
const trimmedQuery = query.trim()
if (!trimmedQuery) {
  return []  // Empty search returns empty array
}

// This typically calls fetchProducts with search parameter
return fetchProducts(1, 100, trimmedQuery)
```

**Output Data Types:**
```javascript
Product[]
```

---

## Error Handling Pattern

All handlers follow this pattern:

```javascript
export const productsHandlers = {
  someMethod: async (params) => {
    try {
      // 1. Validate inputs
      if (!params) throw new Error('Invalid parameters')
      
      // 2. Transform data
      const transformedData = transformData(params)
      
      // 3. Call API
      const response = await productsAPI.someCall(transformedData)
      
      // 4. Return formatted response
      return response.data
      
    } catch (error) {
      // 5. Handle and re-throw errors
      const message = error.response?.data?.message || 
                     error.message || 
                     'An unexpected error occurred'
      throw new Error(message)
    }
  }
}
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
  image_data: string | null;
  image_mime_type: string | null;
  min_stock_level: number;
  max_stock_level: number;
  total_stock: number;
  supplier: string | null;
  created_at: string;
}

interface CreateProductInput {
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

interface FetchProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ProductsHandlers {
  fetchProducts: (page?: number, limit?: number, search?: string) => Promise<FetchProductsResponse>;
  createProduct: (formData: CreateProductInput) => Promise<Product>;
  updateProduct: (productId: number, formData: Partial<CreateProductInput>) => Promise<Product>;
  deleteProduct: (productId: number) => Promise<{ product_id: number; deleted: boolean }>;
  searchProducts: (query: string) => Promise<Product[]>;
}
```

---

## Dependencies
- `utils/productsAPI.js` - API layer
- `utils/productsHelpers.js` - Helper functions
