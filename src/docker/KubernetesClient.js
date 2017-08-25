const http = require('http');
const logger = require('../logger/Logger').get();
const Config = require('../Config');

function kubeHttpGet(path) {
  return new Promise((resolve, reject) => {
    const host = 'localhost';
    http.get({
      host,
      port: Config.kubernetesProxyPort,
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
  static async listEngines(discoveryIds) {
    const pods = await kubeHttpGet(`/api/v1/pods?labelSelector=miraDiscoveryId in (${discoveryIds})`);
    const result = [];

    pods.items.forEach((pod) => {
      const ipAddress = pod.status.podIP;
      if (ipAddress.length !== 0) {
        const properties = pod.metadata.labels;
        const port = properties[Config.enginePortLabel] ?
          properties[Config.enginePortLabel] : Config.enginePort;
        const key = `${ipAddress}:${port}`;
        result.push({ key, properties, ipAddress, port });
      }
    });

    return result;
  }
}

module.exports = KubernetesClient;
