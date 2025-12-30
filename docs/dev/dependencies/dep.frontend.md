# Frontend Dependencies - Storium IMS

## Overview
This document outlines all dependencies for the React frontend application.

## Package Summary
- **Package Name:** storium-ims-frontend
- **Version:** 0.0.0
- **Node.js Version:** 18+ (ES Modules required)
- **Package Manager:** npm
- **Module System:** ES Modules (`"type": "module"`)
- **Build Tool:** Vite
- **React Version:** 19.1.1

---

## Production Dependencies

| Dependency | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **react** | ^19.1.1 | UI library for building interactive components | [React Docs](https://react.dev/) |
| **react-dom** | ^19.1.1 | React bindings for DOM rendering | [React DOM Docs](https://react.dev/reference/react-dom) |
| **react-router-dom** | ^7.9.6 | Client-side routing for single-page applications | [React Router Docs](https://reactrouter.com/) |
| **axios** | ^1.13.1 | HTTP client for API requests | [Axios Docs](https://axios-http.com/) |
| **@hello-pangea/dnd** | ^18.0.1 | Drag and drop functionality for React | [@hello-pangea/dnd Docs](https://github.com/hello-pangea/dnd) |
| **lucide-react** | ^0.562.0 | Icon library for React | [Lucide React Docs](https://lucide.dev/) |
| **react-icons** | ^5.5.0 | Popular icon library as React components | [React Icons Docs](https://react-icons.github.io/react-icons/) |
| **react-toastify** | ^11.0.5 | Toast notification library for React | [React Toastify Docs](https://fkhadra.github.io/react-toastify/) |
| **recharts** | ^3.6.0 | Charting library built with React components | [Recharts Docs](https://recharts.org/) |
| **jspdf** | ^3.0.4 | PDF generation library | [jsPDF Docs](https://github.com/parallax/jsPDF) |
| **jspdf-autotable** | ^5.0.2 | Plugin for jsPDF to generate tables | [jsPDF AutoTable Docs](https://github.com/parallax/jsPDF-AutoTable) |
| **papaparse** | ^5.5.3 | CSV parser for JavaScript | [PapaParse Docs](https://www.papaparse.com/) |
| **node-cron** | ^4.2.1 | Task scheduling library | [node-cron Docs](https://github.com/kelektiv/node-cron) |
| **nodemailer** | ^7.0.11 | Email sending library | [Nodemailer Docs](https://nodemailer.com/) |
| **react-is** | ^19.0.0 | React utility library for type checking | [React-is Docs](https://www.npmjs.com/package/react-is) |

---

## Development Dependencies

| Dependency | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **vite** | 7.1.14 (rolldown-vite) | Fast build tool and dev server | [Vite Docs](https://vitejs.dev/) |
| **@vitejs/plugin-react** | ^5.0.4 | Vite plugin for React Fast Refresh | [Plugin Docs](https://github.com/vitejs/vite-plugin-react) |
| **eslint** | ^9.36.0 | JavaScript linter for code quality | [ESLint Docs](https://eslint.org/) |
| **@eslint/js** | ^9.36.0 | ESLint JavaScript configurations | [ESLint JS Docs](https://www.npmjs.com/package/@eslint/js) |
| **eslint-plugin-react-hooks** | ^5.2.0 | ESLint plugin for React hooks rules | [Plugin Docs](https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks) |
| **eslint-plugin-react-refresh** | ^0.4.22 | ESLint plugin for React Fast Refresh | [Plugin Docs](https://github.com/ArnaudBarre/eslint-plugin-react-refresh) |
| **autoprefixer** | ^10.4.22 | PostCSS plugin to add vendor prefixes | [Autoprefixer Docs](https://github.com/postcss/autoprefixer) |
| **@types/react** | ^19.1.16 | TypeScript types for React | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| **@types/react-dom** | ^19.1.9 | TypeScript types for React DOM | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| **globals** | ^16.4.0 | Global variables for ESLint | [Globals Docs](https://www.npmjs.com/package/globals) |

---

## Detailed Usage

### 1. React 19.1.1 & React DOM 19.1.1
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### 2. React Router DOM 7.9.6
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AlertsPage from './pages/AlertsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### 3. Axios 1.13.1
```javascript
import axios from 'axios';

// API client configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 5000
});

// GET request
const fetchAlerts = async () => {
  const response = await api.get('/alerts');
  return response.data;
};

// POST request
const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};
```

---

### 4. @hello-pangea/dnd (Drag and Drop)
```javascript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function RackVisualization() {
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    // Handle drag-and-drop logic
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="racks">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Draggable draggableId="product-1" index={0}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  Product Item
                </div>
              )}
            </Draggable>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

---

### 5. Lucide React 0.562.0
```javascript
import { AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

function AlertsPage() {
  return (
    <div>
      <AlertCircle size={24} className="text-red-500" />
      <CheckCircle size={24} className="text-green-500" />
      <Trash2 size={24} className="text-gray-500" />
    </div>
  );
}
```

---

### 6. React Icons 5.5.0
```javascript
import { FaHome, FaList, FaChartBar } from 'react-icons/fa';

function Navigation() {
  return (
    <nav>
      <FaHome /> Home
      <FaList /> Products
      <FaChartBar /> Analytics
    </nav>
  );
}
```

---

### 7. React Toastify 11.0.5
```javascript
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const handleSave = () => {
    try {
      // Save logic
      toast.success('Saved successfully!');
    } catch (error) {
      toast.error('Failed to save!');
    }
  };

  return (
    <>
      <button onClick={handleSave}>Save</button>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
```

---

### 8. Recharts 3.6.0
```javascript
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const data = [
  { name: 'Jan', sales: 400 },
  { name: 'Feb', sales: 300 },
  { name: 'Mar', sales: 500 },
];

function SalesChart() {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Line type="monotone" dataKey="sales" stroke="#8884d8" />
    </LineChart>
  );
}
```

---

### 9. jsPDF & jsPDF AutoTable 3.0.4 & 5.0.2
```javascript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function generatePDF() {
  const doc = new jsPDF();
  
  doc.text('Transaction Report', 10, 10);
  
  autoTable(doc, {
    head: [['Date', 'Product', 'Quantity']],
    body: [
      ['2025-01-01', 'Product A', '10'],
      ['2025-01-02', 'Product B', '5'],
    ],
    startY: 20,
  });

  doc.save('report.pdf');
}
```

---

### 10. PapaParse 5.5.3
```javascript
import Papa from 'papaparse';

function importCSV(file) {
  Papa.parse(file, {
    header: true,
    complete: (results) => {
      console.log('Parsed CSV:', results.data);
    },
    error: (error) => {
      console.error('CSV parsing error:', error);
    }
  });
}
```

---

### 11. Node-cron 4.2.1
```javascript
import cron from 'node-cron';

// Schedule a task to run every minute
cron.schedule('* * * * *', () => {
  console.log('Running scheduled task...');
});

// Schedule alerts refresh every 5 seconds
cron.schedule('*/5 * * * * *', () => {
  fetchAlerts();
});
```

---

### 12. Nodemailer 7.0.11
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendAlertEmail(alert) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: alert.email,
    subject: 'Storium Alert',
    text: `Alert: ${alert.message}`,
  });
}
```

---

## Build Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

---

## Configuration Files

### Vite Configuration (`vite.config.js`)
- Fast build tool with hot module replacement
- Optimized for React development
- Configured with Rolldown backend

### ESLint Configuration (`eslint.config.js`)
- Code quality enforcement
- React and React Hooks support

### PostCSS Configuration (`postcss.config.js`)
- Autoprefixer for CSS vendor prefixes
- Tailwind CSS support (if configured)
