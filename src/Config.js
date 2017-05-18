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
   * Initializes the configuration.
   * @param {object} commandLineOptions - Options passed as command line arguments when starting the service.
   */
  static init(commandLineOptions) {
    Config.miraPort = 9100;
    Config.enginePort = 9076;

    Config.engineImageName = process.env.QIX_ENGINE_IMAGE_NAME;
    if (!Config.engineImageName) {
      Config.engineImageName = 'qlikea/engine';
    }

    Config.mode = commandLineOptions.mode || 'swarm';
    if (Config.mode !== 'local' && Config.mode !== 'swarm') {
      logger.error('Incorrect operation mode. Use --mode option.');
      process.exit(1);
    }
  }
}

module.exports = Config;
