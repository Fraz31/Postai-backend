import { config } from '../config/env.js';

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

function getTimestamp() {
  return new Date().toISOString();
}

function formatLog(level, message, data = null) {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message
  };
  if (data) {
    logEntry.data = data;
  }
  return JSON.stringify(logEntry);
}

export const logger = {
  error: (message, data) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
  },
  warn: (message, data) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
  },
  info: (message, data) => {
    if (config.nodeEnv !== 'test') {
      console.log(formatLog(LOG_LEVELS.INFO, message, data));
    }
  },
  debug: (message, data) => {
    if (config.nodeEnv === 'development') {
      console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  }
};
