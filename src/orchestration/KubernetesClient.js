const k8s = require('@kubernetes/client-node');
const logger = require('../logger/Logger').get();
const Config = require('../Config');

/**
 * Class providing a Kubernetes client implementation that collects information on engines.
 */
class KubernetesClient {
  /**
   * Lists engines.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines() {
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster();

    const k8sApi = kc.makeApiClient(k8s.Apps_v1Api);

    const replicaPromise = k8sApi.listReplicaSetForAllNamespaces();
    const deploymentPromise = k8sApi.listDeploymentForAllNamespaces();
    const podPromise = k8sApi.listPodForAllNamespaces(undefined, undefined, undefined, Config.discoveryLabel);

    const replicaMap = new Map();
    try {
      const replicaResponse = await replicaPromise;
      replicaResponse.body.items.forEach((item) => {
        replicaMap.set(item.metadata.uid, item);
      });
    } catch (error) {
      // Do nothing.
      logger.info("error" + error);
    }

    const deploymentMap = new Map();
    try {
      const deploymentResponse = await deploymentPromise;
      deploymentResponse.body.deployments.items.forEach((item) => {
        deploymentMap.set(item.metadata.uid, item);
      });
    } catch (error) {
      // Do nothing.
      logger.info("error" + error);
    }

    const podResponse = await podPromise;
    const pods = podResponse.body;
    logger.info(`pods: ${JSON.stringify(pods)}`);

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
