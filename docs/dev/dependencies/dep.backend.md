# Backend Dependencies - Storium IMS

## Overview
This document outlines all dependencies for the Node.js/Express backend server.

## Package Summary
- **Package Name:** storium-ims-backend
- **Version:** 1.0.0
- **Node.js Version:** 18+ (ES Modules required)
- **Package Manager:** npm
- **Module System:** ES Modules (`"type": "module"`)

---

## Production Dependencies

| Dependency | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **express** | ^5.2.1 | Web framework for Node.js | [Express Docs](https://expressjs.com/) |
| **mysql2** | ^3.15.3 | MySQL client for Node.js with promise support | [MySQL2 Docs](https://github.com/sidorares/node-mysql2) |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing middleware | [CORS Docs](https://github.com/expressjs/cors) |
| **dotenv** | ^17.2.3 | Environment variable management | [dotenv Docs](https://github.com/motdotla/dotenv) |
| **multer** | ^2.0.2 | File upload handling middleware | [Multer Docs](https://github.com/expressjs/multer) |
| **react-dnd** | ^16.0.1 | Drag and drop functionality for React | [React DnD Docs](https://react-dnd.github.io/react-dnd/) |
| **react-dnd-html5-backend** | ^16.0.1 | HTML5 backend for React DnD | [Backend Docs](https://react-dnd.github.io/react-dnd/docs/backends/html5) |

---

## Development Dependencies

| Dependency | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **nodemon** | ^3.1.10 | Auto-restart server during development | [Nodemon Docs](https://nodemon.io/) |

---

## Detailed Usage

### 1. Express 5.2.1
```javascript
import express from 'express';
const app = express();

// Express 5 async error handling
app.get('/', async (req, res, next) => {
  try {
    const data = await someAsyncOperation();
    res.json(data);
  } catch (err) {
    next(err);
  }
});
```

---

### 2. MySQL2 3.15.3
```javascript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promise-based queries
const [rows] = await pool.execute('SELECT * FROM products');
```

---

### 3. CORS 2.8.5
```javascript
import cors from 'cors';

// Basic usage
app.use(cors());

// Configured for React frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

---

### 4. dotenv 17.2.3
```javascript
import dotenv from 'dotenv';
dotenv.config();

// Access environment variables
const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST;
```

**Required `.env` file structure:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=storium_ims
```

---

### 5. Multer 2.0.2
```javascript
import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Single file upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ filename: req.file.filename });
});

// Multiple files upload
app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
  res.json({ files: req.files });
});
```

**Use Cases:**
- Product image uploads
- Document attachments
- Batch file processing
- CSV imports

---

### 6. React DnD 16.0.1 & HTML5 Backend 16.0.1
```javascript
// Frontend React component
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <InventoryBoard />
    </DndProvider>
  );
}

// Draggable item
function DraggableProduct({ product }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'product',
    item: { id: product.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {product.name}
    </div>
  );
}

// Drop target
function DropSlot({ onDrop }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'product',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  return (
    <div ref={drop} style={{ backgroundColor: isOver ? '#e0e0e0' : 'white' }}>
      Drop here
    </div>
  );
}
```

**Use Cases:**
- Drag-and-drop stock placement in racks
- Visual inventory reorganization
- Interactive slot management
- Intuitive UI for warehouse operations

**Note:** While these are React packages, they're included in the backend `package.json` for monorepo or development purposes.

---

### 7. Nodemon 3.1.10
```javascript
// Used in development to automatically restart the server
// Configured in package.json scripts
// No direct code usage - runs as a CLI tool

// Example package.json scripts:
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

**Configuration (nodemon.json):**
```json
{
  "watch": ["src", "server.js"],
  "ignore": ["node_modules", "uploads", "logs"],
  "ext": "js,json",
  "env": {
    "NODE_ENV": "development"
  }
}
```

**Use Cases:**
- Automatic server restart on file changes
- Faster development workflow
- Eliminates manual restart process
- Monitors specific file patterns

---

## Scripts
```bash
# Production start
npm start
# => node server.js

# Development with auto-restart
npm run dev
# => nodemon server.js
```

---

## Version Constraints

### Node.js Compatibility
- **Minimum:** Node.js 18.0.0
- **Recommended:** Node.js 20.x LTS

### Breaking Changes to Note
- **Express 5.x:** Some middleware functions must return promises
- **MySQL2 3.x:** Requires Node.js 14+
- **ES Modules:** All imports use `import`/`export` syntax
- **Multer 2.x:** New API changes from v1.x
- **React DnD 16.x:** Requires React 16.8+ for hooks support

---

## Installation
```bash
# Install all dependencies
npm install

# Install production dependencies only
npm install --production

# Check for outdated packages
npm outdated

# Update all dependencies (use with caution)
npm update

# Audit for security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

---

## File Structure Recommendations
```
storium-ims-backend/
├── server.js
├── package.json
├── .env
├── .gitignore
├── uploads/           # Multer file storage
│   ├── products/
│   └── documents/
├── config/
│   └── db.js
├── routes/
│   ├── products.js
│   ├── inventory.js
│   └── uploads.js
└── middleware/
    ├── upload.js
    └── errorHandler.js
```

---

## Security Considerations

- Keep all dependencies updated regularly
- Run `npm audit` to check for vulnerabilities
- Review dependency licenses for compliance
- Implement file upload validation and sanitization
- Set appropriate file size limits in Multer
- Use environment variables for sensitive configuration
- Enable CORS only for trusted origins in production
- Implement rate limiting for file uploads
- Scan uploaded files for malware
- Store uploaded files outside the web root when possible

---

## Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=storium_ims
DB_PORT=3306

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```