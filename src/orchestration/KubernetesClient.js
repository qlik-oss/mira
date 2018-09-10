const k8s = require('@kubernetes/client-node');
const logger = require('../logger/Logger').get();
const Config = require('../Config');

/**
 * Class providing a Kubernetes client implementation that collects information on engines.
 */
class KubernetesClient {

  constructor() {
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster();
    this.k8sAppsApi = kc.makeApiClient(k8s.Apps_v1Api);
    this.k8sCoreApi = kc.makeApiClient(k8s.Core_v1Api);
  }

  /**
   * Lists engines.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines() {
    const replicaPromise = this.k8sAppsApi.listReplicaSetForAllNamespaces();
    const deploymentPromise = this.k8sAppsApi.listDeploymentForAllNamespaces();
    const podPromise = this.k8sCoreApi.listPodForAllNamespaces(undefined, undefined, undefined, Config.discoveryLabel);

    const replicaMap = new Map();
    try {
      const replicaResponse = await replicaPromise;
      replicaResponse.body.items.forEach((item) => {
        replicaMap.set(item.metadata.uid, item);
      });
    } catch (error) {
      // Do nothing.
    }

    const deploymentMap = new Map();
    try {
      const deploymentResponse = await deploymentPromise;
      deploymentResponse.body.items.forEach((item) => {
        deploymentMap.set(item.metadata.uid, item);
      });
    } catch (error) {
      // Do nothing.
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

module.exports = new KubernetesClient();
