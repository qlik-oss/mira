const http = require('http');
const logger = require('winston');
const containerized = require('containerized');

const engineHealthEndpoint = '/healthcheck';

class EngineHealthFetcher {
  static fetch(engine) {
    return new Promise((resolve, reject) => {
      const port = containerized() ? engine.port : engine.publicPort;
      const host = containerized() ? engine.ipAddress : 'localhost';
      if (!port) {
        reject('No IP address defiend');
      }
      if (!port) {
        reject('No port defined');
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
        reject('No connection to engine');
      });
    });
  }
}

module.exports = EngineHealthFetcher;
