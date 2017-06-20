const logger = require('./logger/Logger').get();

/**
 * Class providing the ability to fetch health-check status from an engine.
 */
class EngineHealthFetcher {
  /**
   * Creates new {@link EngineHealthFetcher} object.
   * @param {object} http - HTTP client to use. Interface must comply with standard Node.js http module.
   * @param {string} host - The host of the engine.
   * @param {number} port - The port of the engine.
   * @param {string} path - The path to the engine health check endpoint (e.g. '/healthcheck').
   */
  constructor(http, host, port, path) {
    this.http = http;
    this.host = host;
    this.port = port;
    this.path = path;
  }

  /**
   * Fetchers health-check status from engine.
   * @returns {Promise<object>} Promise to engine health status as JSON. Rejected if failing to retrieve engine health.
   */
  fetch(host, port, path) {
    return new Promise((resolve, reject) => {
      if (!host) { reject('No host defined'); }
      if (!port) { reject('No port defined'); }

      this.http.get({ host, port, path }, (response) => {
        let body = '';
        response.on('data', (d) => {
          body += d;
        });
        response.on('error', (d) => {
          response.resume();
          logger.error(`Engine health check got HTTP error response: ${d}`);
          reject(d);
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(err);
          }
        });
      }).on('error', (d) => {
        logger.error(`Engine health check got HTTP error response: ${d}`);
        reject('No connection to engine');
      });
    });
  }
}

module.exports = EngineHealthFetcher;
