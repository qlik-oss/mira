const logger = require('../logger/Logger').get();
const LocalDockerClient = require('./LocalDockerClient');
const SwarmDockerClient = require('./SwarmDockerClient');


/**
 * Docker client class definition.
 * @typedef {Object} DockerClient
 * @prop {Function} listEngines - Lists QIX Engine instances as an array of {@link EngineEntry} objects.
 */

/**
 * Gets a Docker client implementation for the provided operation mode.
 * @param {string} mode - Service operation mode.
 * @returns {DockerClient} The Docker client implementation.
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
