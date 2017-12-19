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
  static async listEngines() {
    const pods = await kubeHttpGet(`/api/v1/pods?labelSelector=${Config.discoveryLabel}`);
    const validPods = pods.items.filter(
      (pod) => {
        if (pod.status.phase.toLowerCase() === 'running') {
          logger.debug(`Valid engine pod info received: ${JSON.stringify(pod)}`);
          return true;
        }
        logger.info(`Discarding non-running engine pod: ${JSON.stringify(pod)}`);
        return false;
      });

    const engineInfoEntries = validPods.map((pod) => {
      const labels = pod.metadata.labels;
      const engine = { ip: pod.status.podIP };
      const key = pod.metadata.uid;
      return { key, engine, kubernetes: pod, labels };
    });

    return engineInfoEntries;
  }
}

module.exports = KubernetesClient;
