// config.js
// ConfigMap-mapped env vars (non-sensitive)
const config = {
  port: parseInt(process.env.PORT || "8080", 10),
  appName: process.env.APP_NAME || "eks-demo-backend",
  appEnv: process.env.APP_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  // Secret-mapped env vars (sensitive) — read safely, never log values
  apiKey: process.env.API_KEY || null,
  dbPassword: process.env.DB_PASSWORD || null,
};

module.exports = config;
