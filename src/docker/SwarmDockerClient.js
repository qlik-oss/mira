const Docker = require('dockerode');
const logger = require('../logger/Logger').get();
const Config = require('../Config');

let dockerode = new Docker();

function getProperties(task) {
  return Object.assign({}, task.Spec.ContainerSpec.Labels);
}

function getIpAddress(task) {
  let ipAddr;

  if (task.NetworksAttachments) { // This might not be available during startup of a service
    task.NetworksAttachments.forEach((network) => {
      if (!ipAddr && !network.Network.Spec.Ingress) {
        const fullIpAddr = network.Addresses[0];
        const slashPos = fullIpAddr.indexOf('/');
        ipAddr = (slashPos >= 0) ? fullIpAddr.substring(0, slashPos) : fullIpAddr;
      }
    });
  }

  if (!ipAddr) {
    logger.warn('Encountered task with no network attachments (when getting IP addr)', task);
  }

  return ipAddr;
}

function getTasks(docker, discoveryIds) {
  return new Promise((resolve, reject) => {
    docker.listTasks({ filters: '{ "desired-state": ["running"] }' }, (err, tasks) => {
      if (!err) {
        const labeledEngineTasks = tasks.filter(task => discoveryIds.indexOf(
          task.Spec.ContainerSpec.Labels.miraDiscoveryId) >= 0);
        resolve(labeledEngineTasks);
      } else {
        logger.error('Error when listing Docker Swarm tasks', err);
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
   * @param {string[]} discoveryIds - Array of engine discovery identifiers.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines(discoveryIds) {
    const engineTasks = await getTasks(SwarmDockerClient.docker, discoveryIds);
    const engineInfoEntries = engineTasks.map((task) => {
      const properties = getProperties(task);
      const ipAddress = getIpAddress(task);
      const port = Config.enginePort;
      const key = `${ipAddress}:${port}`;
      return { key, properties, ipAddress, port };
    });
    return engineInfoEntries;
  }
}

module.exports = SwarmDockerClient;
