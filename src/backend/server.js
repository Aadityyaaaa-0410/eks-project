const express = require("express");
const cors = require("cors");
const config = require("./config");

const app = express();

// --- CORS allowlist ---
// config.allowedOrigins is already a parsed array (see config.js)
const allowedOrigins = config.allowedOrigins;

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/postman/no-origin
      if (allowedOrigins.includes("*")) return cb(null, true);
      return allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

let isReady = true;

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    ready: isReady,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/status", (_req, res) => {
  res.status(200).json({
    service: config.appName,
    version: process.env.npm_package_version || "1.0.0",
    environment: config.appEnv,
    timestamp: new Date().toISOString(),
    products: [
      {
        id: 1,
        name: "Gaming Laptop",
        price: 1299,
        image:
          "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&auto=format&fit=crop",
      },
      {
        id: 2,
        name: "Wireless Headphones",
        price: 199,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop",
      },
      {
        id: 3,
        name: "Smart Watch",
        price: 299,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop",
      },
      {
        id: 4,
        name: "Mechanical Keyboard",
        price: 149,
        image:
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&auto=format&fit=crop",
      },
    ],
  });
});

const PORT = config.port || 5000;

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("Gracefully shutting down...");
  server.close(() => {
    process.exit(0);
  });
});
