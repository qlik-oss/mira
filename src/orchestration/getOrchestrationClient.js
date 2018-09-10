const LocalDockerClient = require('./LocalDockerClient');
const SwarmDockerClient = require('./SwarmDockerClient');
const KubernetesClient = require('./KubernetesClient');
const DnsClient = require('./DnsClient');

/**
 * Gets an orchestration client implementation for the provided operation mode.
 * @param {string} mode - Service operation mode.
 * @returns {OrchestrationClient} The orchestration client implementation.
 */
function getOrchestrationClient(mode) {
  switch (mode) {
    case 'local':
      return LocalDockerClient();
    case 'swarm':
      return SwarmDockerClient();
    case 'kubernetes':
      return KubernetesClient();
    case 'dns':
      return DnsClient;
    case 'none':
      return { listEngines: () => [] };
    default:
      return undefined;
  }
}

module.exports = getOrchestrationClient;
