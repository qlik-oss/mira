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
      Logger.logger = new (winston.Logger)({
        transports: [
          new(winston.transports.Console)({
            timestamp: true,
            json: false,
            stringify: true,
            level: process.env.MIRA_LOG_LEVEL || 'info',
            humanReadableUnhandledException: true,
            formatter: (options) => {
              return {
                logseverity: options.level,
                message: options.message,
                timestamp: options.timestamp,
              };
            },
          }),
        ],
      });
    }
    return Logger.logger;
  }
}

module.exports = Logger;
