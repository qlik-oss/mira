const winston = require('winston');

/**
 * Class providing a shared logger instance to be used in all files.
 */
class Logger {
  /**
   * Gets the shared logger instance.
   * @returns {object} The logger object, winston API.
   */
  static get() {
    if (!Logger.logger) {
      Logger.logger = winston.createLogger({
        transports: [
          new (winston.transports.Console)({
            level: process.env.MIRA_LOG_LEVEL || 'info',
            formatter: options => JSON.stringify({
              logseverity: options.level.toUpperCase(),
              message: options.message,
              timestamp: new Date(Date.now()).toISOString(),
            }),
          }),
        ],
      });
    }
    return Logger.logger;
  }
}

module.exports = Logger;
