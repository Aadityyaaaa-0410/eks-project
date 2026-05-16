// logger.js — lightweight structured logger
const config = require("./config");

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[config.logLevel] ?? LEVELS.info;

function log(level, message, meta = {}) {
  if ((LEVELS[level] ?? 99) > currentLevel) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: config.appName,
    env: config.appEnv,
    message,
    ...meta,
  };
  // Use stderr for errors, stdout for everything else
  const output = level === "error" ? process.stderr : process.stdout;
  output.write(JSON.stringify(entry) + "\n");
}

module.exports = {
  error: (msg, meta) => log("error", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  info: (msg, meta) => log("info", msg, meta),
  debug: (msg, meta) => log("debug", msg, meta),
};
