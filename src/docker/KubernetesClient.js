const http = require('http');
const logger = require('../logger/Logger').get();

// function listEndpoints() {
//   return new Promise((resolve, reject) => {
//     const host = 'localhost';
//     const port = 8001;
//     http.get({
//       host,
//       port,
//       path: '/api/v1/endpoints',
//     }, (response) => {
//       let body = '';
//       response.on('data', (d) => {
//         body += d;
//       });
//       response.on('error', (d) => {
//         response.resume();
//         logger.error(`Kubernetes endpoints returned HTTP error: ${d}`);
//         reject(d);
//       });
//       response.on('end', () => {
//         try {
//           resolve(JSON.parse(body));
//         } catch (err) {
//           reject(err);
//         }
//       });
//     }).on('error', (d) => {
//       logger.error(`Kubernetes endpoints returned HTTP error: ${d}`);
//       reject('No connection to kubernetes');
//     });
//   });
// }

function kubeHttpGet(path) {
  return new Promise((resolve, reject) => {
    const host = 'localhost';
    const port = 8001;
    http.get({
      host,
      port,
      path,
    }, (response) => {
      let body = '';
      response.on('data', (d) => {
        body += d;
      });
      response.on('error', (d) => {
        response.resume();
        logger.error(`Kubernetes ${path} returned HTTP error (response.on): ${d}`);
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
      logger.error(`Kubernetes ${path} returned HTTP error (get.on): ${d}`);
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
    const pods = await kubeHttpGet('/api/v1/pods?labelSelector=com.qlik.mira.id=qix-engine');
    const result = [];

    pods.items.forEach((pod) => {
      logger.debug('pod', pod.metadata.labels);
      // const port = qixPorts[0].port;
      //       const properties = endpoint.metadata.labels || {};
      //       const ipAddress = address.ip;
      //       const key = `${ipAddress}:${port}`;
      //       result.push({ key, properties, ipAddress, port });
    });

    return result;
  }
}

module.exports = KubernetesClient;
