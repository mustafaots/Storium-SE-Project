# Backend Server Configuration

## File Location
`backend/server.js`

## Purpose
Main entry point for the Express.js server. Initializes the application, configures middleware, loads routes, and starts the HTTP server on the configured port.

## Key Responsibilities

1. **Server Initialization**
   - Create Express app instance
   - Set port (default: 5000 from `.env`)
   - Configure host (default: localhost)

2. **Middleware Setup**
   - CORS (Cross-Origin Resource Sharing)
   - JSON body parser
   - Request logging
   - Error handling middleware
   - Not found handler

3. **Route Registration**
   - Load all feature routes (products, alerts, transactions, etc.)
   - Load utility routes
   - Mount on `/api` prefix

4. **Database Connection**
   - Initialize MySQL connection pool
   - Verify database connectivity

5. **Server Startup**
   - Listen on configured port
   - Log startup message
   - Handle shutdown gracefully

## Configuration

```javascript
// Environment Variables Required
PORT=5000                    // Server port
HOST=localhost              // Server host
NODE_ENV=development        // Environment (development/production)
DB_HOST=localhost           // Database host
DB_USER=root                // Database user
DB_PASSWORD=password        // Database password
DB_NAME=storium             // Database name
```

## Middleware Chain

```
Request
  ↓
CORS Handler
  ↓
JSON Parser (express.json)
  ↓
Request Logger (morgan/custom)
  ↓
Static Files Handler (public/)
  ↓
Route Handlers (/api/*)
  ↓
Not Found Handler (404)
  ↓
Error Handler
  ↓
Response
```

## Startup Process

```
1. Load environment variables (.env file)
2. Initialize database connection pool
3. Create Express app
4. Configure middleware (in order above)
5. Register all route handlers
6. Start listening on PORT
7. Log "Server running on http://HOST:PORT"
```

## Error Handling

- Catches unhandled promise rejections
- Graceful shutdown on SIGTERM/SIGINT
- Database connection errors logged to console
- Server errors sent as JSON responses

## Dependencies

```javascript
{
  "express": "5.2.1",
  "mysql2": "3.15.3",
  "dotenv": "^16.0.0",
  "cors": "^2.8.5",
  "morgan": "^1.10.0"
}
```

## Database Connection

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

**Connection Pool Configuration:**
- Max 10 concurrent connections
- Queue unlimited pending requests
- Auto-reconnect enabled
- Connection timeout: 60 seconds

## Route Registration Example

```javascript
// Feature routes
app.use('/api/products', require('./src/routes/products.routes'));
app.use('/api/alerts', require('./src/routes/alerts.routes'));
app.use('/api/transactions', require('./src/routes/transactions.routes'));
app.use('/api/clients', require('./src/routes/clients.routes'));
app.use('/api/sources', require('./src/routes/sources.routes'));
app.use('/api/routines', require('./src/routes/routines.routes'));
app.use('/api/locations', require('./src/routes/locations.routes'));
app.use('/api/visualise', require('./src/routes/visualise.routes'));

// Utility routes
app.use('/api/utility', require('./src/routes/utility.routes'));
```

## Environment Setup

Create `.env` file in backend root:

```
NODE_ENV=development
PORT=5000
HOST=localhost

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=storium

JWT_SECRET=your_secret_key
JWT_EXPIRY=7d

LOG_LEVEL=info
```

## Production Considerations

- Use `NODE_ENV=production`
- Set `HOST=0.0.0.0` for external access
- Use environment-based port
- Enable request compression
- Set rate limiting
- Enable HTTPS
- Use connection pooling
- Configure CORS properly with whitelist

## Startup Commands

```bash
# Development
npm run dev

# Production
npm start

# With nodemon (auto-restart on changes)
nodemon server.js
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env or kill process on that port |
| Database connection failed | Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env |
| CORS errors | Check CORS configuration, client origin in whitelist |
| Routes not loading | Verify route files exist in src/routes/ |
| Undefined middleware | Import all middleware before registering routes |

## Testing

```javascript
// Health check endpoint (should be added)
app.get('/api/health', (req, res) => {
  res.json({success: true, message: 'Server is running'});
});
```

Visit `http://localhost:5000/api/health` to verify server is running.
