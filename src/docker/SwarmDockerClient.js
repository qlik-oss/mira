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
  if (task.NetworksAttachments) { // This might not be available during startup of a service
    // eslint-disable-next-line no-restricted-syntax
    for (const network of task.NetworksAttachments) {
      if (!network.Network.Spec.Ingress) {
        const fullIpAddr = network.Addresses[0];
        const slashPos = fullIpAddr.indexOf('/');
        const ipAddr = (slashPos >= 0) ? fullIpAddr.substring(0, slashPos) : fullIpAddr;
        return ipAddr;
      }
    }
  }
  logger.warn('Encountered task with no network attachments (when getting IP addr)', task);
  return undefined;
}

function getNetworks(task) {
  const networks = [];
  if (task.NetworksAttachments) {
    // eslint-disable-next-line no-restricted-syntax
    for (const network of task.NetworksAttachments) {
      networks.push({
        name: network.Network.Spec.Name,
        addresses: network.Addresses
      });
    }
  } else {
    logger.warn('Encountered task with no network attachments (when getting networks)', task);
  }
  return networks;
}

function getPublicPort(serviceSpec) {
  if (serviceSpec.Endpoint.Ports) { // Might not be available during startup
    return serviceSpec.Endpoint.Ports[0].PublishedPort;
  }
  return undefined;
}

function getServiceMap() {
  return new Promise((resolve, reject) => {
    docker.listServices({}, (err, services) => {
      if (!err) {
        const serviceMap = {};
        for (let i = 0; i < services.length; i += 1) {
          serviceMap[services[i].ID] = services[i];
        }
        resolve(serviceMap);
      } else {
        logger.error('Error when listing Docker Swarm services', err);
        reject(err);
      }
    });
  });
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
   * @param {string} engineImageName - The Engine Docker image name used to determine if a container is an engine instance.
   * @returns {Promise<EngineEntry[]>} A promise to a list of engine entries.
   */
  static async listEngines(engineImageName) {
    const serviceMap = await getServiceMap();
    const tasks = await getTasks();
    const engineTasks = tasks.filter(task => getImageNameOfTask(task) === engineImageName);
    const engineInfoEntries = engineTasks.map((task) => {
      const properties = getProperties(task);
      const ipAddress = getIpAddress(task);
      const port = Config.enginePort;
      const serviceSpec = serviceMap[task.ServiceID];
      const publicPort = getPublicPort(serviceSpec);
      const networks = getNetworks(task);
      return {
        properties,
        ipAddress,
        port,
        publicPort,
        networks
      };
    });
    return engineInfoEntries;
  }
}

module.exports = SwarmDockerClient;
