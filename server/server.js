// ===========================
// 📦 Core Dependencies
// ===========================
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

// ===========================
// 🗂️ Internal Imports
// ===========================
import songRoutes from "./routes/songRoutes.js";
import { connectDB, getConnectionStatus, closeConnection } from "./config/db.js";

// ===========================
// ⚙️ Environment Setup
// ===========================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL // ✅ optional for production
].filter(Boolean);

// ===========================
// 🧠 Middleware: CORS Config
// ===========================
app.use(cors({
  origin: FRONTEND_ORIGINS,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors()); // ✅ Handle preflight requests explicitly

// ===========================
// 🛡️ Security & Logging Middleware
// ===========================
app.use(helmet({
  crossOriginResourcePolicy: false // Prevents blocking of cross-origin static files
}));
app.use(morgan(NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===========================
// 📁 Paths & Static Serving
// ===========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔒 Static file CORS fix
const staticCors = cors({
  origin: FRONTEND_ORIGINS,
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

// ✅ Serve public assets safely
app.use("/style", staticCors, express.static(path.join(__dirname, "public/style")));
app.use("/songs", staticCors, express.static(path.join(__dirname, "public/songs")));
app.use("/assets", staticCors, express.static(path.join(__dirname, "public/assets")));
app.use("/uploads", staticCors, express.static(path.join(__dirname, "uploads")));

// ===========================
// 🚦 Rate Limiting
// ===========================
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "development" ? 1000 : 200,
  message: {
    error: "Too many requests, please try again later."
  }
}));

// ===========================
// 🎵 API Routes
// ===========================
app.use("/api/songs", songRoutes);

// ===========================
// 💚 Health Check Endpoint
// ===========================
app.get("/health", (req, res) => {
  const dbStatus = getConnectionStatus();
  res.status(200).json({
    status: "success",
    message: "🎵 Music Player API is healthy",
    environment: NODE_ENV,
    port: PORT,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// ===========================
// 🔧 Test Route for CORS
// ===========================
app.get("/api/test-cors", (req, res) => {
  res.json({
    message: "✅ CORS is working correctly",
    origin: req.headers.origin,
    time: new Date().toISOString()
  });
});

// ===========================
// 🏠 Root Route
// ===========================
app.get("/", (req, res) => {
  res.json({
    message: "🎧 Welcome to Z-Music API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      songs: "/api/songs",
      testCORS: "/api/test-cors"
    }
  });
});

// ===========================
// ⚠️ 404 Route
// ===========================
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
    hint: "Refer to / for available API endpoints"
  });
});

// ===========================
// 🧱 Global Error Handler
// ===========================
app.use((err, req, res, next) => {
  console.error("🚨 Error Stack:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: "error",
      message: `Duplicate value for field: ${field}`
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  res.status(err.status || 500).json({
    status: "error",
    message: NODE_ENV === "production"
      ? "Something went wrong!"
      : err.message,
    ...(NODE_ENV === "development" && { stack: err.stack })
  });
});

// ===========================
// 🧹 Graceful Shutdown Handlers
// ===========================
process.on("unhandledRejection", err => {
  console.error("💥 UNHANDLED REJECTION:", err);
  process.exit(1);
});

process.on("uncaughtException", err => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("👋 SIGTERM RECEIVED. Closing gracefully...");
  await closeConnection();
  process.exit(0);
});

// ===========================
// 🚀 Start Server
// ===========================
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`
🎵  Z-Music API Server Running!
📍  Port: ${PORT}
🌍  Env: ${NODE_ENV}
📚  API: http://localhost:${PORT}/api/songs
❤️  Health: http://localhost:${PORT}/health
🔧  CORS: http://localhost:${PORT}/api/test-cors
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
export default app;
