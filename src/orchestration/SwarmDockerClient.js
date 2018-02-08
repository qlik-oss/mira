const Docker = require('dockerode');
const logger = require('../logger/Logger').get();
const Config = require('../Config');

let dockerode = new Docker();

function getLabels(task) {
  return Object.assign({}, task.Spec.ContainerSpec.Labels);
}

function getIpAddress(task) {
  const networks = task.NetworksAttachments.filter(network => !network.Network.Spec.Ingress && (network.Network.Spec.Name === Config.engineNetwork || !Config.engineNetwork));

  if (networks.length === 0) {
    logger.warn(`No matching networks found for task ${task.ID}`);
    return undefined;
  } else if (networks.length > 1 && !Config.engineNetwork) {
    logger.warn(`Found ${networks.length} networks for task ${task.ID}, but which docker network to use was not specified. Choosing address from network ${networks[0].Network.Spec.Name}.`);
  }

  const fullIpAddr = networks[0].Addresses[0];
  const slashPos = fullIpAddr.indexOf('/');
  const ipAddr = (slashPos >= 0) ? fullIpAddr.substring(0, slashPos) : fullIpAddr;

  return ipAddr;
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
  static get docker() { return dockerode; }

  /**
   * Sets the Dockerode instance to use.
   * Mainly for testing purposes. Should normally not be used externally,
   * @param {Docker} value - The Dockerode instance to use for Docker Engine API access.
   */
  static set docker(value) { dockerode = value; }

  /**
   * Lists engines.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines() {
    const engineTasks = await getTasks(SwarmDockerClient.docker, Config.discoveryLabel);
    const engineInfoEntries = engineTasks.map((task) => {
      const key = task.ID;
      return {
        key,
        engine: {
          ip: getIpAddress(task),
        },
        swarm: task,
        labels: getLabels(task),
      };
    });
    return engineInfoEntries.filter(entry => entry.engine.ip);
  }
}

module.exports = SwarmDockerClient;
