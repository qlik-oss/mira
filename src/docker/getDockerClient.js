const LocalDockerClient = require('./LocalDockerClient');
const SwarmDockerClient = require('./SwarmDockerClient');
const KubernetesClient = require('./KubernetesClient');

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
