// server.js - Main Express Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import middleware
import requestLogger from './src/middleware/logger.js';
import notFoundHandler from './src/middleware/notFound.js';
import errorHandler from './src/middleware/errorHandler.js';

// Import routes
import clientsRoutes from './src/routes/clients.routes.js';
import locationsRoutes from './src/routes/locations.routes.js';
import utilityRoutes from './src/routes/utility.routes.js';

dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/],
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

// ===== ROUTES =====
app.use('/api/clients', clientsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api', utilityRoutes);

// ===== ERROR HANDLING =====
app.use(notFoundHandler);
app.use(errorHandler);

// ===== SERVER STARTUP =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});