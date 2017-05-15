const http = require('http');
const logger = require('winston');

const engineHealthEndpoint = '/healthcheck';

class EngineHealthFetcher {
  static fetch(engine) {
    return new Promise((resolve, reject) => {
      http.get({
        host: engine.ipAddress,
        port: engine.port,
        path: engineHealthEndpoint
      }, (response) => {
        let body = '';
        response.on('data', (d) => {
          body += d;
        });
        response.on('error', (d) => {
          logger.error(`Engine health check got HTTP error response: ${d}`);
          reject(d);
        });
        response.on('end', () => {
          resolve(JSON.parse(body));
        });
      });
    });
  }
}

module.exports = EngineHealthFetcher;
