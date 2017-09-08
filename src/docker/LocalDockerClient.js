const Docker = require('dockerode');
const containerized = require('containerized');
const logger = require('../logger/Logger').get();

const localhostIp = '127.0.0.1';

let dockerode = new Docker();

function getIpAddress(container) {
  if (containerized()) {
    const firstKey = Object.keys(container.NetworkSettings.Networks)[0];
    return container.NetworkSettings.Networks[firstKey].IPAddress;
  }
  return localhostIp;
}

/**
 * Class providing a Docker client implementation that collects information on engines that
 * run locally as containers in a non-cluster configuration.
 */
class LocalDockerClient {
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
   * @param {string} discoveryLabel - Engine discovery label to filter on.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines(discoveryLabel) {
    return new Promise((resolve, reject) => {
      LocalDockerClient.docker.listContainers((err, containers) => {
        if (!err) {
          const engineContainers = containers.filter(
            container => discoveryLabel in container.Labels);
          const engineInfoEntries = engineContainers.map((local) => {
            const labels = local.Labels;
            const engine = {
              ip: getIpAddress(local),
            };
            const key = local.Id;
            return { key, engine, local, labels };
          });
          resolve(engineInfoEntries);
        } else {
          logger.error('Failed to list engine containers', err);
          reject(err);
        }
      });
    });
  }
}

module.exports = LocalDockerClient;
