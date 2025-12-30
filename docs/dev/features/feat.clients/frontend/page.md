# Clients Frontend - Complete Documentation

## File Locations
- `frontend/src/pages/Clients/ClientsPage.jsx`
- `frontend/src/hooks/useClients.js`
- `frontend/src/handlers/clientsHandlers.js`
- `frontend/src/utils/clientsAPI.js`
- `frontend/src/components/Clients/`

---

## Page Component

### Component State

```javascript
{
  clients: Client[],
  loading: boolean,
  error: string | null,
  showForm: boolean,
  isEditing: boolean,
  currentClient: Client | null,
  
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  },
  
  searchQuery: string,
  selectedClients: number[],  // For bulk operations
  viewMode: 'grid' | 'list' | 'table'
}

type Client = {
  client_id: number,
  client_name: string,
  contact_email: string | null,
  contact_phone: string,
  address: string | null,
  created_at: string
}
```

### Key Sub-components

```javascript
<SearchBar value={searchQuery} onChange={handleSearch} />
<ClientsTable
  data={clients}
  onSelect={handleSelectClient}
  onEdit={handleEditClient}
  onDelete={handleDeleteClient}
  loading={loading}
/>
<ClientForm
  client={currentClient}
  onSubmit={handleFormSubmit}
  isEditing={isEditing}
/>
<ClientDetails client={currentClient} />
<Pagination
  current={pagination.page}
  total={pagination.pages}
  onPageChange={handlePageChange}
/>
```

### User Interactions

**Search Clients:**
```
User types "acme"
  ↓
handleSearch("acme")
  ↓
Call loadClients(1, limit, "acme")
  ↓
GET /api/clients?search=acme
  ↓
Update table with filtered results
```

**Add New Client:**
```
Click "Add Client"
  ↓
setShowForm(true)
  ↓
setCurrentClient(null)
  ↓
setIsEditing(false)
  ↓
Show ClientForm modal
  ↓
User fills form and submits
  ↓
POST /api/clients
  ↓
Reload list, close form, show toast
```

---

## Hooks (useClients.js)

```javascript
const [clients, setClients] = useState<Client[]>([])
const [loading, setLoading] = useState<boolean>(false)
const [error, setError] = useState<string | null>(null)
const [showForm, setShowForm] = useState<boolean>(false)
const [isEditing, setIsEditing] = useState<boolean>(false)
const [currentClient, setCurrentClient] = useState<Client | null>(null)
const [pagination, setPagination] = useState<PaginationState>({
  page: 1,
  limit: 10,
  total: 0,
  pages: 0
})

return {
  clients, loading, error, showForm, isEditing, currentClient, pagination,
  setError, setShowForm, setIsEditing, setCurrentClient,
  
  loadClients: (page?: number, limit?: number, search?: string) => Promise<void>,
  createClient: (data: ClientData) => Promise<void>,
  updateClient: (id: number, data: ClientData) => Promise<void>,
  deleteClient: (id: number) => Promise<void>,
  handlePageChange: (newPage: number) => void,
  handlePageSizeChange: (newSize: number) => void
}
```

### Hook Methods

**loadClients(page, limit, search)**
```javascript
Process:
1. setLoading(true)
2. clientsHandlers.fetchClients(page, limit, search)
3. setClients(data)
4. setPagination(pagination)
5. setLoading(false)
```

**createClient(data)**
```javascript
Input: {
  client_name: string,
  contact_email: string | null,
  contact_phone: string | null,
  address: string | null
}

Process:
1. Validate data
2. clientsHandlers.createClient(data)
3. POST /api/clients
4. Reload clients list
5. Close form, show toast
```

---

## Handlers (clientsHandlers.js)

### fetchClients(page, limit, search)

```javascript
page = Math.max(1, page)
limit = Math.min(Math.max(1, limit), 100)
search = search.trim()

const response = await clientsAPI.getAll(page, limit, search)
if (!response.success) throw new Error(response.message)
return response.data
```

### createClient(data)

```javascript
// Validation
if (!data.client_name || data.client_name.trim().length < 2)
  throw new Error('Client name must be at least 2 characters')

if (data.contact_email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(data.contact_email))
    throw new Error('Invalid email format')
}

// API call
const response = await clientsAPI.create(data)
if (!response.success) throw new Error(response.message)
return response.data
```

### updateClient(id, data)

```javascript
// Similar validation as create
const response = await clientsAPI.update(id, data)
if (!response.success) throw new Error(response.message)
```

### deleteClient(id)

```javascript
if (!confirm('Delete this client? This cannot be undone.'))
  return

const response = await clientsAPI.delete(id)
if (!response.success) throw new Error(response.message)
```

---

## API Methods (clientsAPI.js)

### getAll(page, limit, search)

```javascript
GET /api/clients?page=1&limit=10&search=

Response (200):
{
  success: boolean,
  message: string,
  data: Client[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

### getById(id)

```javascript
GET /api/clients/5

Response (200):
{
  success: boolean,
  message: string,
  data: Client
}
```

### create(data)

```javascript
POST /api/clients

Content-Type: application/json

{
  "client_name": "Acme Corp",
  "contact_email": "contact@acme.com",
  "contact_phone": "+1-555-0100",
  "address": "123 Business Ave, City, ST 12345"
}

Response (201):
{
  success: boolean,
  message: string,
  data: {
    client_id: number,
    ...
  }
}
```

### update(id, data)

```javascript
PUT /api/clients/5

{
  "client_name": "Updated Name",
  "contact_email": "newemail@company.com",
  ...
}

Response (200):
{
  success: boolean,
  message: string,
  data: null
}
```

### delete(id)

```javascript
DELETE /api/clients/5

Response (200):
{
  success: boolean,
  message: string,
  data: null
}
```

---

## Components

### ClientsTable

```javascript
interface ClientsTableProps {
  data: Client[],
  loading: boolean,
  onSelect: (client: Client) => void,
  onEdit: (client: Client) => void,
  onDelete: (clientId: number) => void,
  sorting?: SortConfig
}

Columns: ID, Name, Email, Phone, Address, Created, Actions
```

### ClientForm

```javascript
interface ClientFormProps {
  client: Client | null,
  onSubmit: (data: ClientData) => Promise<void>,
  isEditing: boolean
}

Fields: client_name, contact_email, contact_phone, address
Validation: inline + server-side
```

### ClientCard

```javascript
interface ClientCardProps {
  client: Client,
  onEdit: (client: Client) => void,
  onDelete: (id: number) => void
}

Displays: Name, email, phone, address, created date
```

---

## Data Types

```typescript
interface ClientData {
  client_name: string,
  contact_email: string | null,
  contact_phone: string | null,
  address: string | null
}

interface PaginationState {
  page: number,
  limit: number,
  total: number,
  pages: number
}
```
