// Structured Logging Framework
// Provides consistent, production-ready logging with levels, context, and remote logging

const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

const LogConfig = {
  currentLevel: LogLevel.INFO,
  enableConsole: true,
  enableRemote: false, // Set to true to enable remote logging
  remoteEndpoint: null, // Configure endpoint for remote logging
  maxLogSize: 1000, // Max logs to keep in memory
  includeTimestamp: true,
  includeStackTrace: true
};

class StructuredLogger {
  constructor(module) {
    this.module = module;
    this.logs = [];
  }

  _formatMessage(level, message, context = {}) {
    const logEntry = {
      level: this._getLevelName(level),
      module: this.module,
      message,
      timestamp: LogConfig.includeTimestamp ? new Date().toISOString() : undefined,
      context: Object.keys(context).length > 0 ? context : undefined,
      stackTrace: LogConfig.includeStackTrace && level >= LogLevel.ERROR ? new Error().stack : undefined
    };

    return logEntry;
  }

  _getLevelName(level) {
    return Object.keys(LogLevel).find(key => LogLevel[key] === level) || 'UNKNOWN';
  }

  _logToConsole(logEntry) {
    if (!LogConfig.enableConsole) return;

    const { level, module, message, timestamp, context } = logEntry;
    const prefix = timestamp ? `[${timestamp}] ` : '';
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';

    switch (level) {
      case 'DEBUG':
        console.debug(`${prefix}[${module}] ${message}${contextStr}`);
        break;
      case 'INFO':
        console.info(`${prefix}[${module}] ${message}${contextStr}`);
        break;
      case 'WARN':
        console.warn(`${prefix}[${module}] ${message}${contextStr}`);
        break;
      case 'ERROR':
      case 'FATAL':
        console.error(`${prefix}[${module}] ${message}${contextStr}`);
        break;
      default:
        console.log(`${prefix}[${module}] ${message}${contextStr}`);
    }
  }

  async _logToRemote(logEntry) {
    if (!LogConfig.enableRemote || !LogConfig.remoteEndpoint) return;

    try {
      await fetch(LogConfig.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  _storeLog(logEntry) {
    this.logs.push(logEntry);
    if (this.logs.length > LogConfig.maxLogSize) {
      this.logs.shift();
    }
  }

  async log(level, message, context = {}) {
    if (level < LogConfig.currentLevel) return;

    const logEntry = this._formatMessage(level, message, context);
    
    this._logToConsole(logEntry);
    this._storeLog(logEntry);
    await this._logToRemote(logEntry);
  }

  debug(message, context) {
    return this.log(LogLevel.DEBUG, message, context);
  }

  info(message, context) {
    return this.log(LogLevel.INFO, message, context);
  }

  warn(message, context) {
    return this.log(LogLevel.WARN, message, context);
  }

  error(message, context) {
    return this.log(LogLevel.ERROR, message, context);
  }

  fatal(message, context) {
    return this.log(LogLevel.FATAL, message, context);
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

// Global logger factory
const loggers = new Map();

function getLogger(module) {
  if (!loggers.has(module)) {
    loggers.set(module, new StructuredLogger(module));
  }
  return loggers.get(module);
}

// Configure logging
function configureLogging(config) {
  Object.assign(LogConfig, config);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getLogger, configureLogging, LogLevel };
} else {
  window.StructuredLogger = { getLogger, configureLogging, LogLevel };
}
