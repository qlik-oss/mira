const Docker = require('dockerode');
const logger = require('../logger/Logger').get();
const Config = require('../Config');

let dockerode = new Docker();

function getLabels(task) {
  return Object.assign({}, task.Spec.ContainerSpec.Labels);
}

function getIpAddresses(task) {
  const addresses = task.NetworksAttachments
    .filter(network => !network.Network.Spec.Ingress)
    .map((network) => {
      const fullIpAddr = network.Addresses[0];
      const slashPos = fullIpAddr.indexOf('/');
      const ip = (slashPos >= 0) ? fullIpAddr.substring(0, slashPos) : fullIpAddr;

      return { name: network.Network.Spec.Name, ip };
    });

  if (!addresses || addresses.length === 0) {
    logger.warn(`Encountered task with no networks ${JSON.stringify(task)}`);
    return undefined;
  }

  return addresses;
}

function findStatusIp(task, networks) {
  if (!networks) {
    logger.warn(`No network found for task: ${JSON.stringify(task)}`);
    return undefined;
  }
  if (networks.length === 1) {
    return networks[0].ip;
  }
  if (!Config.engineNetworks) {
    logger.warn(`Found multiple docker networks for task: ${JSON.stringify(task)}, but no network configured for environment variable MIRA_SWARM_ENGINE_NETWORKS`);
    return undefined;
  }

  const statusNetworks = networks.filter(network => Config.engineNetworks.includes(network.name));

  if (!statusNetworks || statusNetworks.length === 0) {
    logger.warn(`No docker network found matching name in ${Config.engineNetworks} for task ${JSON.stringify(task)}`);
    return undefined;
  }

  return statusNetworks[0].ip;
}

function getTasks(docker, discoveryLabel) {
  return new Promise((resolve, reject) => {
    docker.listTasks({}, (err, tasks) => {
      if (!err) {
        // We do filtering on the discovery label here, but this should be possible to do by
        // specifying the filter in the listTasks() call above.
        const labeledTasks = tasks.filter(task => discoveryLabel in task.Spec.ContainerSpec.Labels);
        const runningTasks = labeledTasks.filter((task) => {
          if (task.Status.State.toLowerCase() === 'running') {
            logger.debug(`Valid engine container task received: ${JSON.stringify(task)}`);
            return true;
          }
          logger.debug(`Discarding non-running engine task: ${JSON.stringify(task)}`);
          return false;
        });
        resolve(runningTasks);
      } else {
        reject(err);
      }
    });
  });
}

/**
 * Class providing a Docker client implementation that collects information on engines that
 * run in Docker Swarm mode.
 */
class SwarmDockerClient {
  /**
   * Gets the Dockerode instance used.
   * Mainly for testing purposes. Should normally not be used externally.
   * @returns {Docker} The Dockerode instance used for Docker Engine API access.
   */
  static get docker() {
    return dockerode;
  }

  /**
   * Sets the Dockerode instance to use.
   * Mainly for testing purposes. Should normally not be used externally,
   * @param {Docker} value - The Dockerode instance to use for Docker Engine API access.
   */
  static set docker(value) {
    dockerode = value;
  }

  /**
   * Lists engines.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines() {
    const engineTasks = await getTasks(SwarmDockerClient.docker, Config.discoveryLabel);
    const engineInfoEntries = engineTasks.map((task) => {
      const labels = getLabels(task);
      const networks = getIpAddresses(task);
      const statusIp = findStatusIp(task, networks);
      const key = task.ID;
      return {
        key,
        engine: { networks, labels },
        swarm: task,
        statusIp,
      };
    });
    return engineInfoEntries.filter(entry => entry.statusIp);
  }
}

module.exports = SwarmDockerClient;
