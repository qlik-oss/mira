const logger = require('winston');
const LocalDockerClient = require('./LocalDockerClient');
const SwarmDockerClient = require('./SwarmDockerClient');

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
