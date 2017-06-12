/* eslint-disable no-restricted-syntax */
const http = require('http');
const logger = require('../logger/Logger').get();

function listEndpoints() {
  return new Promise((resolve, reject) => {
    const host = 'localhost';
    const port = 8001;
    http.get({
      host,
      port,
      path: '/api/v1/endpoints'
    }, (response) => {
      let body = '';
      response.on('data', (d) => {
        body += d;
      });
      response.on('error', (d) => {
        response.resume();
        logger.error(`Kubernetes endpoints returned HTTP error: ${d}`);
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
      logger.error(`Kubernetes endpoints returned HTTP error: ${d}`);
      reject('No connection to kubernetes');
    });
  });
}

/**
 * Class providing a Docker client implementation that collects information on engines that
 * run in Docker Swarm mode.
 */
class KubernetesClient {
  /**
   * Lists engines.
   * @param {string} engineImageName - The Engine Docker image name used to determine if a container is an engine instance.
   * @returns {Promise<EngineEntry[]>} A promise to a list of engine entries.
   */
  static async listEngines() {
    const endpointsData = await listEndpoints('default');

    const result = [];
    for (const endpoint of endpointsData.items) {
      for (const subset of endpoint.subsets) {
        const qixPorts = subset.ports.filter(item => item.name === 'qix');
        if (qixPorts.length > 0) { // The service has a qix port exposed
          const port = qixPorts[0].port;
          for (const address of subset.addresses) {
            const item = {
              properties: endpoint.metadata.labels,
              ipAddress: address.ip,
              port
            };
            result.push(item);
          }
        }
      }
    }
    return result;
  }
}

module.exports = KubernetesClient;
