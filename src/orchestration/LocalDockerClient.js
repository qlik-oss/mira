const Docker = require('dockerode');
const logger = require('../logger/Logger').get();
const Config = require('../Config');

const localhostIp = '127.0.0.1';

let dockerode = new Docker();

function getIpAddress(container) {
  if (Config.containerized) {
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
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines() {
    return new Promise((resolve, reject) => {
      LocalDockerClient.docker.listContainers({ filters: { label: [Config.discoveryLabel] } }, (err, containers) => {
        if (!err) {
          const runningContainers = containers.filter((container) => {
            if (container.State.toLowerCase() === 'running') {
              logger.debug(`Valid engine container info received: ${JSON.stringify(container)}`);
              return true;
            }
            logger.debug(`Discarding non-running engine container: ${JSON.stringify(container)}`);
            return false;
          });
          const engineInfoEntries = runningContainers.map((local) => {
            const labels = local.Labels;
            const engine = {
              ip: getIpAddress(local),
            };
            const key = local.Id;
            return { key, engine, local, labels };
          });
          resolve(engineInfoEntries);
        } else {
          reject(err);
        }
      });
    });
  }
}

module.exports = LocalDockerClient;
