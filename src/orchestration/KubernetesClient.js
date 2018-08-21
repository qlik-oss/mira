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
        reject(new Error(`Kubernetes ${path} returned HTTP error (response.on): ${d}`));
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (d) => {
      reject(new Error(`Kubernetes ${path} returned HTTP error (get.on): ${d}`));
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
    const replicaMap = new Map();
    try {
      const replicaSets = await kubeHttpGet('/apis/apps/v1/replicasets');
      replicaSets.items.forEach((item) => {
        replicaMap.set(item.metadata.uid, item);
      });
    } catch (error) {
      logger.warn('Could not retrive replicaset information, verify your RBAC settings');
    }

    const deploymentMap = new Map();
    try {
      const deployments = await kubeHttpGet('/apis/apps/v1/deployments');
      deployments.items.forEach((item) => {
        deploymentMap.set(item.metadata.uid, item);
      });
    } catch (error) {
      logger.warn('Could not retrive deployment information, verify your RBAC settings');
    }


    const pods = await kubeHttpGet(`/api/v1/pods?labelSelector=${Config.discoveryLabel}`);
    const runningPods = pods.items.filter((pod) => {
      if (pod.status.phase.toLowerCase() === 'running') {
        logger.debug(`Valid engine pod info received: ${JSON.stringify(pod)}`);
        return true;
      }
      logger.debug(`Discarding non-running engine pod: ${JSON.stringify(pod)}`);
      return false;
    });
    const engineInfoEntries = runningPods.map((pod) => {
      const { labels } = pod.metadata;
      const ip = pod.status.podIP;
      const engine = { networks: [{ ip }], labels };
      const key = pod.metadata.uid;
      const replicaSet = replicaMap.get(pod.metadata.ownerReferences[0].uid);
      const deployment = replicaSet ? deploymentMap.get(replicaSet.metadata.ownerReferences[0].uid) : undefined;
      const kubernetes = {
        pod,
        replicaSet,
        deployment,
      };
      return {
        key, engine, kubernetes, statusIp: ip,
      };
    });

    return engineInfoEntries;
  }
}

module.exports = KubernetesClient;
