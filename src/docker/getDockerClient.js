const logger = require('../logger/Logger').get();
const LocalDockerClient = require('./LocalDockerClient');
const SwarmDockerClient = require('./SwarmDockerClient');

/**
 * Gets a Docker Client implementation for the provided operation mode.
 * @param {string} mode - Service operation mode.
 * @returns {Object} The Docker Client implementatin.
 */
function getDockerClient(mode) {
  switch (mode) {
    case 'local':
      logger.info('Local Docker Client requested');
      return LocalDockerClient;
    case 'swarm':
      logger.info('Swarm Mode Docker Client requested');
      return SwarmDockerClient;
    default:
      logger.error('Unknown/no Docker Client requested');
      return undefined;
  }
}

module.exports = getDockerClient;
