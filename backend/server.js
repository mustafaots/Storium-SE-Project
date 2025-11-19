// dont exist yet
// app.use('/api/alerts', require('./src/routes/alerts.routes'));
// app.use('/api/products', require('./src/routes/products.routes'));
// app.use('/api/routines', require('./src/routes/routines.routes'));
// app.use('/api/schema', require('./src/routes/schema.routes'));
// app.use('/api/settings', require('./src/routes/settings.routes'));
// app.use('/api/sources', require('./src/routes/sources.routes'));
// app.use('/api/transactions', require('./src/routes/transactions.routes'));
// app.use('/api/visualise', require('./src/routes/visualise.routes'));


// server.js - FIXED VERSION
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Import routes
import clientsRoutes from './src/routes/clients.routes.js';

app.use('/api/clients', clientsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Storium IMS API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Clients API: http://localhost:${PORT}/api/clients`);
});