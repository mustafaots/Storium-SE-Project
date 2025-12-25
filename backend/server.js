// server.js - Main Express Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Middlewares
import requestLogger from './src/middleware/logger.js';
import notFoundHandler from './src/middleware/notFound.js';
import errorHandler from './src/middleware/errorHandler.js';
import { db } from './src/config/database.js';

// Import routes
import clientsRoutes from './src/routes/clients.routes.js';
import locationsRoutes from './src/routes/locations.routes.js';
import utilityRoutes from './src/routes/utility.routes.js';
import transactionsRoutes from './src/routes/transactions.routes.js';
import productsRoutes from './src/routes/products.routes.js';
import sourcesRoutes from './src/routes/sources.routes.js';
import visualiseRoutes from './src/routes/visualise.routes.js';

// Services (The Robot)
// ⚠️ CHECK PATH: If your file is in 'src/scheduler.js', remove '/services'
import { startScheduler } from './src/services/scheduler.js'; 

// Routes
import clientsRoutes from './src/routes/clients.routes.js';
import sourcesRoutes from './src/routes/sources.routes.js';
import routinesRoutes from './src/routes/routines.routes.js'; 
import alertsRoutes from './src/routes/alerts.routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// ===== MIDDLEWARE =====

// Database middleware to attach connection to req
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/],
  credentials: true
}));
app.use(express.json());
// ===========================================
// 1. MIDDLEWARE (ORDER MATTERS!)
// ===========================================
// Enable CORS for Frontend
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/], credentials: true }));

// ⚠️ CRITICAL: PARSE JSON BODY
// This fixes: "Cannot read properties of undefined (reading 'alert_type')"
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Log Requests
app.use(requestLogger);

// ===== ROUTES =====

// API Routes
app.use('/api/clients', clientsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/visualise', visualiseRoutes);
app.use('/api', utilityRoutes);

// Health check
// ===========================================
// 2. ROUTES
// ===========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Storium IMS API is running' });
});

app.use('/api/clients', clientsRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/routines', routinesRoutes); 
app.use('/api/alerts', alertsRoutes);

// ===========================================
// 3. ERROR HANDLING (MUST BE AT THE END)
// ===========================================
app.use(notFoundHandler);
app.use(errorHandler);

// ===========================================
// 4. START SERVER
// ===========================================
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);

  // Start the Automation Scheduler
  try {
      startScheduler();
  } catch (err) {
      console.error("❌ Failed to start Scheduler:", err.message);
  }
});
