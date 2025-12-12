// server.js - COMPLETE VERSION WITH ALL MIDDLEWARE
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import middleware
import requestLogger from './src/middleware/logger.js';
import notFoundHandler from './src/middleware/notFound.js';
import errorHandler from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();

// ===== MIDDLEWARE ORDER MATTERS! =====

// 1. CORS - First to handle cross-origin requests
app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/],
  credentials: true
}));

// 2. Body parsing
app.use(express.json());

// 3. Request logging - Log all incoming requests
app.use(requestLogger);

// ===== ROUTES =====

// Import routes
import clientsRoutes from './src/routes/clients.routes.js';
import locationsRoutes from './src/routes/locations.routes.js';

// API Routes
app.use('/api/clients', clientsRoutes);
app.use('/api/locations', locationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Storium IMS API is running' });
});

// ===== ERROR HANDLING MIDDLEWARE (MUST BE LAST) =====

// 4. 404 Handler - Catch routes that don't exist
app.use(notFoundHandler);

// 5. Global Error Handler - MUST BE THE LAST MIDDLEWARE
app.use(errorHandler);

// ===== SERVER STARTUP =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Clients API: http://localhost:${PORT}/api/clients`);
  console.log(`Locations API: http://localhost:${PORT}/api/locations`);
  console.log(`Depots API: http://localhost:${PORT}/api/locations/{locationId}/depots`);
  console.log(`Aisles API: http://localhost:${PORT}/api/locations/{locationId}/depots/{depotId}/aisles`);
  console.log(`Racks API: http://localhost:${PORT}/api/locations/{locationId}/depots/{depotId}/aisles/{aisleId}/racks`);
  console.log('Middleware loaded: CORS, JSON parsing, Request logging, 404 handler, Error handler');
});