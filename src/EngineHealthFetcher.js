const http = require('http');
const logger = require('./logger/Logger').get();

const engineHealthEndpoint = '/healthcheck';

/**
 * Class providing the ability to check health status of an engine.
 */
class EngineHealthFetcher {
  constructor(desktopMode) {
    this.devMode = desktopMode;
  }
  /**
   * Fetches health for the provided engine.
   * @param {object} engine - The engine to fetch health status from.
   * @returns {Promise<object>} Promise to engine health status as JSON. Rejected if failing to retrieve engine health.
   */
  fetch(engine) {
    return new Promise((resolve, reject) => {
      const port = this.devMode ? engine.publicPort : engine.port;
      const host = this.devMode ? 'localhost' : engine.ipAddress;

      if (!host) { reject('No IP address defined'); }
      if (!port) { reject('No port defined'); }

      http.get({
        host,
        port,
        path: engineHealthEndpoint
      }, (response) => {
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
