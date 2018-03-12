const defaultHttp = require('http');
const logger = require('./logger/Logger').get();

/**
 * Class providing the ability to fetch health and metrics from an engine.
 */
class EngineStatusFetcher {
  /**
   * Creates new {@link EngineStatusFetcher} object.
   * @param {object} http - HTTP client to use.
   *   Interface must comply with standard Node.js http module.
   */
  constructor(http) {
    this.http = http || defaultHttp;
  }

  /**
   * Fetches health-check status from engine.
   * @param {string} host - The host name of the engine.
   * @param {string} port - The port of the engine.
   * @param {string} path - The endpoint path to the engine health-check (e.g. '/healthcheck').
   * @returns {Promise<object>} Promise to engine health status as JSON.
   *   Rejected if failing to retrieve engine health.
   * @example
   * // Fetch engine health from 'http://localhost:9076/healthcheck'
   * await healthFetcher.fetch('localhost', 9076, '/healthcheck');
   */
  fetch(host, port, path) {
    return new Promise((resolve, reject) => {
      this.http.get({
        host, port, path, headers: { Accept: 'application/json' },
      }, (response) => {
        let body = '';
        response.on('data', (d) => {
          body += d;
        });
        response.on('error', (d) => {
          response.resume();
          logger.warn(`Engine health check got HTTP error response (response.on: ${d}`);
          reject(d);
        });
        response.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            logger.warn(`Engine health check returned invalid JSON: ${err}`);
            reject(err);
          }
        });
      }).on('error', (d) => {
        logger.warn(`Engine health check got HTTP error response (get.on): ${d}`);
        reject(d);
      });
    });
  }
}

module.exports = EngineStatusFetcher;
