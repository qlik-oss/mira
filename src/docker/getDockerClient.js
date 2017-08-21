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
 * @returns {DockerClient} The Docker client implementation.
 */
function getDockerClient(mode) {
  switch (mode) {
    case 'local':
      return LocalDockerClient;
    case 'swarm':
      return SwarmDockerClient;
    case 'kubernetes':
      return KubernetesClient;
    default:
      return undefined;
  }
}

module.exports = getDockerClient;
