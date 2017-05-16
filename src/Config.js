const logger = require('./logger/Logger').get();

const defaultPort = 9100;
const defaultQixEnginePort = 9076;
const defaultQixEngineImageName = 'qlik/engine';

/**
 * Class representing the configuration options for running the service.
 *
 * When the configuration has been initialized, it is populated with the following data
 * - Config.port - The TCP port the service shall expose its API on.
 * - Config.engineImageName - The image name of the QIX Engine Docker image to use.
 * - Config.enginePort - The port to use for communicating with the QIX Engine.
 * - Config.mode - The operation mode of mira which can be 'local' or 'swarm'.
 */
class Config {
  /**
   * Initializes the configuration.
   * @param {Object} commandLineOptions - Options passed as command line arguments when starting the service.
   */
  static init(commandLineOptions) {
    Config.port = parseInt(process.env.PORT, 10);
    if (!Config.port || isNaN(Config.port)) {
      Config.port = defaultPort;
    }

    Config.engineImageName = process.env.QIX_ENGINE_IMAGE_NAME;
    if (!Config.engineImageName) {
      Config.engineImageName = defaultQixEngineImageName;
    }

    Config.enginePort = parseInt(process.env.QIX_ENGINE_PORT, 10);
    if (!Config.enginePort || isNaN(Config.enginePort)) {
      Config.enginePort = defaultQixEnginePort;
    }

    Config.mode = commandLineOptions.mode || 'swarm'; // swarm is the default value
    if (Config.mode !== 'local' && Config.mode !== 'swarm') {
      logger.error('Incorrect operation mode. Use --mode option.');
      process.exit(1);
    }
  }
}

module.exports = Config;
