const winston = require('winston');

/**
 * Formatting the log according to the service contract
 */
const formatter = winston.format((info) => (
  {
    logseverity: info.level.toUpperCase(),
    timestamp: new Date(Date.now()).toISOString(),
    message: info.message,
  }
));

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
            format: winston.format.combine(
              formatter(),
              winston.format.json(),
            ),
          }),
        ],
      });
    }
    return Logger.logger;
  }
}

module.exports = Logger;
