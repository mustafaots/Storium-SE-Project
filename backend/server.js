import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Middlewares
import requestLogger from './src/middleware/logger.js';
import notFoundHandler from './src/middleware/notFound.js';
import errorHandler from './src/middleware/errorHandler.js';

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
  console.log(`🚀 SERVER RUNNING ON PORT ${PORT}`);

  // Start the Automation Scheduler
  try {
      startScheduler();
  } catch (err) {
      console.error("❌ Failed to start Scheduler:", err.message);
  }
});