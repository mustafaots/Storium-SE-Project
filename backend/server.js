import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import requestLogger from './src/middleware/logger.js';
import notFoundHandler from './src/middleware/notFound.js';
import errorHandler from './src/middleware/errorHandler.js';
import { startScheduler } from './src/services/scheduler.js'; // <--- 1. ADD THIS


dotenv.config();
const app = express();

app.use(cors({ origin: [/^http:\/\/localhost:\d+$/], credentials: true }));
app.use(express.json());
app.use(requestLogger);

// ===== ROUTES =====
import clientsRoutes from './src/routes/clients.routes.js';
import sourcesRoutes from './src/routes/sources.routes.js';
import routinesRoutes from './src/routes/routines.routes.js'; // <--- NEW: YOU ADDED THIS

app.use('/api/clients', clientsRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/routines', routinesRoutes); // <--- NEW: YOU ADDED THIS

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Storium IMS API is running' });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);

  // 2. ADD THIS LINE TO START THE TIMER
  startScheduler(); 
});


