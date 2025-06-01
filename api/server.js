const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const config = require("../config/config");
const { connect, checkHealth } = require("../config/db");
require("dotenv").config();

// Import routes
const authRoutes = require("../routes/auth.routes");
const userRoutes = require("../routes/user.routes");

// Initialize app
const app = express();

// Trust proxy if configured (important for rate limiting behind reverse proxy)
if (config.errorHandling.trustProxy) {
  app.set("trust proxy", 1);
}

// Security middleware
app.use(helmet(config.security.helmet));
app.use(cors(config.security.cors));

// Body parsing middleware with size limits
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));

// Rate limiting - Apply to all API routes
const limiter = rateLimit(config.security.rateLimit);
app.use(config.app.apiPrefix, limiter);

// Logging middleware
app.use(morgan(config.logging.morgan));

// Health check endpoint - should be before API prefix
app.get("/health", async (req, res) => {
  try {
    const health = await checkHealth();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: config.app.environment,
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      database: health,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "error",
      error: config.app.isProduction ? "Service unavailable" : error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: `Welcome to ${config.app.name}`,
    version: process.env.npm_package_version || "1.0.0",
    environment: config.app.environment,
    apiPrefix: config.app.apiPrefix,
    documentation: "/api/docs", // If you add API documentation later
    health: "/health",
  });
});

// API Routes
app.use(`${config.app.apiPrefix}/auth`, authRoutes);
app.use(
  `${config.app.apiPrefix}/users`,
  require("../middleware/protectRoute"),
  userRoutes
);

// API documentation endpoint (placeholder)
app.get(`${config.app.apiPrefix}/docs`, (req, res) => {
  res.json({
    message: "API Documentation",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /auth/register": "Register a new user",
        "POST /auth/login": "Login user",
        "GET /auth/me": "Get current user (protected)",
        "POST /auth/logout": "Logout user (protected)",
      },
      users: {
        "GET /users": "Get all users (admin only)",
        "GET /users/:id": "Get user by ID (protected)",
        "PUT /users/:id": "Update user (protected)",
        "DELETE /users/:id": "Delete user (protected)",
      },
    },
  });
});

// 404 handler for API routes
app.use(`${config.app.apiPrefix}/*`, (req, res) => {
  res.status(404).json({
    status: "error",
    message: "API endpoint not found",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// General 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  // Log error details
  if (config.errorHandling.logErrors) {
    console.error("Error occurred:", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    });
  }

  const status = err.status || err.statusCode || 500;
  let message = "An error occurred";

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      status: "error",
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Token expired",
    });
  }

  // Don't expose internal error messages in production
  if (!config.app.isProduction) {
    message = err.message;
  }

  res.status(status).json({
    status: "error",
    message,
    ...(config.errorHandling.showStack && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// Start server function
const startServer = async () => {
  try {
    // Connect to database
    if (config.db.uri && config.db.password) {
      await connect();
    }

    console.log("✅ Database connected successfully");

    // Start HTTP server
    const server = app.listen(config.app.port, () => {
      console.log(`🚀 Server running in ${config.app.environment} mode`);
      console.log(`📍 Local: http://${config.app.host}:${config.app.port}`);
      console.log(
        `🔌 API: http://${config.app.host}:${config.app.port}${config.app.apiPrefix}`
      );
      console.log(
        `💊 Health: http://${config.app.host}:${config.app.port}/health`
      );
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 ${signal} received. Starting graceful shutdown...`);

      server.close(async (err) => {
        if (err) {
          console.error("❌ Error during server shutdown:", err);
        } else {
          console.log("✅ HTTP server closed");
        }

        try {
          // Close database connection
          const mongoose = require("mongoose");
          await mongoose.connection.close();
          console.log("✅ Database connection closed");
        } catch (dbErr) {
          console.error("❌ Error closing database connection:", dbErr);
        }

        process.exit(err ? 1 : 0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error("⚠️  Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    "🚨 Unhandled Promise Rejection at:",
    promise,
    "reason:",
    reason
  );
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("🚨 Uncaught Exception:", error);
  process.exit(1);
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
