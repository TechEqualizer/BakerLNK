// Production-safe logging utility
const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args) => {
    // Keep warnings in production
    console.warn(...args);
  },
  
  error: (...args) => {
    // Always log errors
    console.error(...args);
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

// For critical production logging
export const productionLogger = {
  error: (message, error) => {
    // In production, you might want to send errors to a service like Sentry
    console.error(`[ERROR] ${message}`, error);
    
    // TODO: Add error tracking service integration here
    // Example: Sentry.captureException(error);
  },
  
  critical: (message, data) => {
    console.error(`[CRITICAL] ${message}`, data);
    
    // TODO: Add alerting service for critical errors
  }
};