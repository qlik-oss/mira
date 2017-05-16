const Docker = require('dockerode');
const containerized = require('containerized');
const logger = require('../logger/Logger').get();

const localhostIp = '127.0.0.1';
const docker = new Docker();

function getProperties(container) {
  return Object.assign({}, container.Labels);
}

function getIpAddress(container) {
  if (containerized()) {
    const firstKey = Object.keys(container.NetworkSettings.Networks)[0];
    return container.NetworkSettings.Networks[firstKey].IPAddress;
  }
  return localhostIp;
}

function getPort(container) {
  if (containerized()) {
    return container.Ports[0].PrivatePort;
  }
  return container.Ports[0].PublicPort;
}

function getNetworks(container) {
  const networks = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const networkName in container.NetworkSettings.Networks) {
    const network = container.NetworkSettings.Networks[networkName];
    networks.push({
      name: networkName,
      addresses: [network.IPAddress]
    });
  }
  return networks;
}

/**
 * Provides the ability to query the docker environment for available engines
 */
class LocalDockerClient {
  /**
   * Returns a promise of a list of engines
   * @returns {Promise<Engine>}
   */
  static async listEngines(engineImageName) {
    return new Promise((resolve, reject) => {
      docker.listContainers((err, containers) => {
        if (!err) {
          const engineContainers = containers.filter(container => container.Image.indexOf(engineImageName) === 0 && container.Names.length > 0);
          const engineInfoEntries = engineContainers.map((container) => {
            const properties = getProperties(container);
            const ipAddress = getIpAddress(container);
            const port = getPort(container);
            const networks = getNetworks(container);
            return {
              properties,
              ipAddress,
              port,
              networks
            };
          });
          resolve(Promise.all(engineInfoEntries));
        } else {
          logger.error('Failed to list engine containers', err);
          reject(err);
        }
      });
    });
  }
}

module.exports = LocalDockerClient;
