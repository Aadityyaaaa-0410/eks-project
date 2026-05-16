// config.js
const config = {
  port: parseInt(process.env.PORT || "8080", 10),
  appName: process.env.APP_NAME || "eks-demo-backend",
  appEnv: process.env.APP_ENV || "development",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
};

module.exports = config;
