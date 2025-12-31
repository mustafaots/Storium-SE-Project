// server.js - Main Express Server
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Middlewares
import requestLogger from "./src/middleware/logger.js";
import notFoundHandler from "./src/middleware/notFound.js";
import errorHandler from "./src/middleware/errorHandler.js";

// DB & Startup
import { db } from "./src/config/database.js";
import { runBestEffortMigrations } from "./src/startup/bestEffortMigrations.js";

// Routes
import clientsRoutes from "./src/routes/clients.routes.js";
import locationsRoutes from "./src/routes/locations.routes.js";
import utilityRoutes from "./src/routes/utility.routes.js";
import transactionsRoutes from "./src/routes/transactions.routes.js";
import productsRoutes from "./src/routes/products.routes.js";
import sourcesRoutes from "./src/routes/sources.routes.js";
import visualiseRoutes from "./src/routes/visualise.routes.js";
import routinesRoutes from "./src/routes/routines.routes.js";
import alertsRoutes from "./src/routes/alerts.routes.js";

// Services
import { startScheduler } from "./src/services/scheduler.service.js";

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = "127.0.0.1"; // ✅ IMPORTANT FOR ELECTRON

// ===========================================
// 1. MIDDLEWARE
// ===========================================

// Allow Electron + Vite dev server
app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/],
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(requestLogger);

// Attach DB to req
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ===========================================
// 2. STARTUP TASKS
// ===========================================

// Non-blocking migrations
runBestEffortMigrations(db).catch((err) => {
  console.warn("⚠️ Best-effort migrations failed:", err?.message || err);
});

// ===========================================
// 3. ROUTES
// ===========================================

// API routes
app.use("/api/clients", clientsRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/sources", sourcesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/visualise", visualiseRoutes);
app.use("/api/routines", routinesRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api", utilityRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Storium IMS API is running",
  });
});

// ===========================================
// 4. ERROR HANDLING (ALWAYS LAST)
// ===========================================

app.use(notFoundHandler);
app.use(errorHandler);

// ===========================================
// 5. START SERVER
// ===========================================

app.listen(PORT, HOST, () => {
  console.log(`🚀 SERVER RUNNING`);
  console.log(`➡️ http://${HOST}:${PORT}`);
  console.log(`❤️ Health: http://${HOST}:${PORT}/api/health`);

  // Start automation scheduler
  try {
    startScheduler();
  } catch (err) {
    console.error("❌ Failed to start Scheduler:", err.message);
  }
});
