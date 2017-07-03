const Docker = require('dockerode');
const logger = require('../logger/Logger').get();
const Config = require('../Config');

const docker = new Docker();

function getProperties(task) {
  return Object.assign({}, task.Spec.ContainerSpec.Labels);
}

function getImageNameOfTask(task) {
  const taskImageName = task.Spec.ContainerSpec.Image;
  const semiColPos = taskImageName.indexOf(':');
  const imageName = (semiColPos >= 0) ? taskImageName.substring(0, semiColPos) : taskImageName;
  return imageName;
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

  return undefined;
}

function getTasks() {
  return new Promise((resolve, reject) => {
    docker.listTasks({ filters: '{ "desired-state": ["running"] }' }, (err, tasks) => {
      if (!err) {
        resolve(tasks);
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
   * Lists engines.
   * @param {string} engineImageName - The Engine Docker image name used to determine if a
   *   container is an engine instance.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines(engineImageName) {
    const tasks = await getTasks();
    const engineTasks = tasks.filter(task => getImageNameOfTask(task) === engineImageName);
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
