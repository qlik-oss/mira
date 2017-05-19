const logger = require('./logger/Logger').get();

/**
 * Class representing the configuration options for running the service.
 *
 * When the configuration has been initialized, it is populated with the following data
 * - Config.miraPort - The TCP port the service shall expose its API on.
 * - Config.engineImageName - The image name of the QIX Engine Docker image to use.
 * - Config.enginePort - The port to use for communicating with the QIX Engine.
 * - Config.mode - The operation mode of mira which can be 'local' or 'swarm'.
 */
class Config {
  /**
   * The port Mira exposes its REST API on.
   */
  static get miraPort() { return 9100; }

  /**
   * The port Mira uses to communicate to QIX Engine instances in a container-to-container configuration.
   */
  static get enginePort() { return 9076; }

  /**
   * The Docker image name that Mira uses to identify QIX Engine instances.
   */
  static get engineImageName() {
    if (!process.env.QIX_ENGINE_IMAGE_NAME) {
      return 'qlikea/engine';
    }
    return process.env.QIX_ENGINE_IMAGE_NAME;
  }

  /**
   * Initializes the configuration.
   * @param {object} commandLineOptions - Options passed as command line arguments when starting the service.
   */
  static init(commandLineOptions) {
    if (!commandLineOptions) {
      Config.mode = 'swarm';
    } else {
      Config.mode = commandLineOptions.mode || 'swarm';
    }
    if (Config.mode !== 'local' && Config.mode !== 'swarm') {
      logger.error('Incorrect operation mode. Use --mode option.');
      process.exit(1);
    }
  }
}

module.exports = Config;
