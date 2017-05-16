const http = require('http');
const logger = require('./logger/Logger').get();
const containerized = require('containerized');

const engineHealthEndpoint = '/healthcheck';

class EngineHealthFetcher {
  static fetch(engine) {
    return new Promise((resolve, reject) => {
      const port = containerized() ? engine.port : engine.publicPort;
      const host = containerized() ? engine.ipAddress : 'localhost';
      if (!port) {
        reject('NO_IP_ADDRESS_DEFINED');
      }
      if (!port) {
        reject('NO_PORT_DEFINED');
      }
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
        reject('NO_CONNECTION_TO_ENGINE');
      });
    });
  }
}

module.exports = EngineHealthFetcher;
