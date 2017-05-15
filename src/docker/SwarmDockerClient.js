const Docker = require('dockerode');
const logger = require('winston');
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
  // eslint-disable-next-line no-restricted-syntax
  for (const network of task.NetworksAttachments) {
    if (!network.Network.Spec.Ingress) {
      const fullIpAddr = network.Addresses[0];
      const slashPos = fullIpAddr.indexOf('/');
      const ipAddr = (slashPos >= 0) ? fullIpAddr.substring(0, slashPos) : fullIpAddr;
      return ipAddr;
    }
  }
  return undefined;
}

function getNetworks(task) {
  const networks = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const network of task.NetworksAttachments) {
    networks.push({
      name: network.Network.Spec.Name,
      addresses: network.Addresses
    });
  }
  return networks;
}

/**
 * Provides the ability to query the docker environment for available engines
 */
class SwarmDockerClient {
  /**
   * Returns a promise of a list of engines
   * @returns {Promise<Engine>}
   */
  static async listEngines(engineImageName) {
    return new Promise((resolve, reject) => {
      docker.listTasks(
        { filters: '{ "desired-state": ["running"] }' },
        (err, tasks) => {
          if (!err) {
            const engineTasks = tasks.filter(task => getImageNameOfTask(task) === engineImageName);
            const engineInfoEntries = engineTasks.map((task) => {
              const properties = getProperties(task);
              const ipAddress = getIpAddress(task);
              const port = Config.enginePort;
              const networks = getNetworks(task);
              return {
                properties,
                ipAddress,
                port,
                networks
              };
            });
            resolve(Promise.all(engineInfoEntries));
          } else {
            logger.error(err);
            reject(err);
          }
        });
    });
  }
}

module.exports = SwarmDockerClient;
