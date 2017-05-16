const winston = require('winston');

/**
 * Class providing a shared logger instance to be used in all files.
 */
class Logger {
  /**
   * Gets the shared logger instance.
   * @returns {Object} - The logger object.
   */
  static get() {
    if (!Logger.logger) {
      Logger.logger = new (winston.Logger)({
        transports: [
          new (winston.transports.Console)({
            timestamp: true,
            json: true,
            stringify: true,
            level: process.env.LOG_LEVEL || 'silly',
            humanReadableUnhandledException: true
          })
        ]
      });
    }
    return Logger.logger;
  }
}

module.exports = Logger;
