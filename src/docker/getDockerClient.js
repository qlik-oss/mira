const logger = require('../logger/Logger').get();
const LocalDockerClient = require('./LocalDockerClient');
const SwarmDockerClient = require('./SwarmDockerClient');
const KubernetesClient = require('./KubernetesClient');

/**
 * Docker client class definition.
 * @typedef {object} DockerClient
 * @prop {function} listEngines - Lists QIX Engine instances as an array of
 *   {@link EngineEntry} objects.
 */

/**
 * Engine container specification.
 * @typedef {object} EngineContainerSpec
 * @prop {string} key - Key that uniquely identifies the engine container.
 * @prop {object} properties - Properties of the engine container.
 * @prop {string} ipAddress - IP address on which the engine container can be reached.
 * @prop {number} port - Port number on which the engine container can be reached.
 */

/**
 * Gets a Docker client implementation for the provided operation mode.
 * @param {string} mode - Service operation mode.
 * @param {number} k8sProxyPort - The proxy port to reach the k8s API server.
 * @returns {DockerClient} The Docker client implementation.
 */
function getDockerClient(mode, k8sProxyPort) {
  switch (mode) {
    case 'local':
      logger.info('Local Docker Client requested');
      return LocalDockerClient;
    case 'swarm':
      logger.info('Swarm Mode Docker Client requested');
      return SwarmDockerClient;
    case 'kubernetes':
      logger.info('Kubernetes Client requested');
      KubernetesClient.proxyPort = k8sProxyPort;
      return KubernetesClient;
    default:
      logger.error('Unknown/no Docker Client requested');
      return undefined;
  }
}

module.exports = getDockerClient;
