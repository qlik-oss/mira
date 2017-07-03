const http = require('http');
const logger = require('../logger/Logger').get();

function listEndpoints() {
  return new Promise((resolve, reject) => {
    const host = 'localhost';
    const port = 8001;
    http.get({
      host,
      port,
      path: '/api/v1/endpoints',
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
 * Class providing a Kubernetes client implementation that collects information on engines.
 */
class KubernetesClient {
  /**
   * Lists engines.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines() {
    const endpointsData = await listEndpoints();
    const result = [];

    endpointsData.items.forEach((endpoint) => {
      endpoint.subsets.forEach((subset) => {
        const qixPorts = subset.ports.filter(item => item.name === 'qix');
        if (qixPorts.length > 0) { // The service has a qix port exposed
          const port = qixPorts[0].port;
          subset.addresses.forEach((address) => {
            const properties = endpoint.metadata.labels;
            const ipAddress = address.ip;
            const key = `${ipAddress}:${port}`;
            result.push({ key, properties, ipAddress, port });
          });
        }
      });
    });

    // for (const endpoint of endpointsData.items) {
    //   for (const subset of endpoint.subsets) {
    //     const qixPorts = subset.ports.filter(item => item.name === 'qix');
    //     if (qixPorts.length > 0) { // The service has a qix port exposed
    //       const port = qixPorts[0].port;
    //       for (const address of subset.addresses) {
    //         const properties = endpoint.metadata.labels;
    //         const ipAddress = address.ip;
    //         const key = `${ipAddress}:${port}`;
    //         result.push({ key, properties, ipAddress, port });
    //       }
    //     }
    //   }
    // }

    return result;
  }
}

module.exports = KubernetesClient;
