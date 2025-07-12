const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { testConnection, initializeDatabase } = require("./config/database");
const usersRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/users", usersRouter);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      success: true,
      message: "Server is running",
      database: dbConnected ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server health check failed",
      error: error.message,
    });
  }
});

// Serve the main HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log("🚀 Starting RDS Test Application...");

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.log(
        "⚠️  Warning: Database connection failed. Please check your configuration."
      );
    }

    // Initialize database tables
    await initializeDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`🌐 Web interface available at http://localhost:${PORT}`);

      if (!dbConnected) {
        console.log("\n⚠️  IMPORTANT: Database connection failed!");
        console.log(
          "Please check your .env file and ensure your RDS instance is accessible."
        );
        console.log(
          "Copy env.example to .env and update with your RDS credentials."
        );
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
