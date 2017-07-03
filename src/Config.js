const logger = require('./logger/Logger').get();

const defaultMiraPort = 9100;
const defaultQixEnginePort = 9076;
const defaultQixEngineImageName = 'qlikea/engine';

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
   * @param {object} commandLineOptions - Options passed as command line arguments when starting
   *   the service.
   */
  static init(commandLineOptions) {
    const options = commandLineOptions || {};

    Config.miraPort = parseInt(process.env.PORT, 10);
    if (!Config.miraPort || isNaN(Config.miraPort)) {
      Config.miraPort = defaultMiraPort;
    }

    Config.engineImageName = process.env.QIX_ENGINE_IMAGE_NAME || defaultQixEngineImageName;

    Config.enginePort = parseInt(process.env.QIX_ENGINE_PORT, 10);
    if (!Config.enginePort || isNaN(Config.enginePort)) {
      Config.enginePort = defaultQixEnginePort;
    }

    Config.mode = options.mode || 'swarm'; // swarm is the default value
    if (Config.mode !== 'local' && Config.mode !== 'swarm' && Config.mode !== 'kubernetes') {
      logger.error('Incorrect operation mode. Use --mode option.');
      process.exit(1);
    }

    /**
     * If true the process is expected to run outside of docker communicating with engines
     * public ports.
     * @type {boolean}
     */
    Config.devMode = process.env.DEV_MODE;
  }
}

module.exports = Config;
