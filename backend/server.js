// server.js - SIMPLE VERSION
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/clients', require('./src/routes/clients.routes'));

// dont exist yet
// app.use('/api/alerts', require('./src/routes/alerts.routes'));
// app.use('/api/products', require('./src/routes/products.routes'));
// app.use('/api/routines', require('./src/routes/routines.routes'));
// app.use('/api/schema', require('./src/routes/schema.routes'));
// app.use('/api/settings', require('./src/routes/settings.routes'));
// app.use('/api/sources', require('./src/routes/sources.routes'));
// app.use('/api/transactions', require('./src/routes/transactions.routes'));
// app.use('/api/visualise', require('./src/routes/visualise.routes'));

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