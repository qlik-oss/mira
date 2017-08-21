const logger = require('./logger/Logger').get();

const defaultMiraPort = 9100;
const defaultQixEnginePort = 9076;
const defaultEngineDiscoveryRefreshRate = 1000;
const defaultEngineHealthRefreshRate = 5000;
const defaultKubernetesProxyPort = 8001;
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
      logger.info(`Mira port set to: ${Config.miraPort}`);
    }

    Config.engineImageName = process.env.QIX_ENGINE_IMAGE_NAME || defaultQixEngineImageName;

    Config.enginePort = parseInt(process.env.QIX_ENGINE_PORT, 10);
    if (!Config.enginePort || isNaN(Config.enginePort)) {
      Config.enginePort = defaultQixEnginePort;
      logger.info(`Engine port set to: ${Config.enginePort}`);
    }

    Config.discoveryRefreshRate = parseInt(process.env.DISCOVERY_REFRESH_RATE_MS, 10);
    if (!Config.discoveryRefreshRate || isNaN(Config.discoveryRefreshRate)) {
      Config.discoveryRefreshRate = defaultEngineDiscoveryRefreshRate;
      logger.info(`Discovery refresh rate set to: ${Config.discoveryRefreshRate}`);
    }

    Config.healthRefreshRate = parseInt(process.env.HEALTH_REFRESH_RATE_MS, 10);
    if (!Config.healthRefreshRate || isNaN(Config.healthRefreshRate)) {
      Config.healthRefreshRate = defaultEngineHealthRefreshRate;
      logger.info(`Health check refresh rate set to: ${Config.healthRefreshRate}`);
    }

    Config.kubernetesProxyPort = parseInt(process.env.KUBERNETES_PROXY_PORT, 10);
    if (!Config.kubernetesProxyPort || isNaN(Config.kubernetesProxyPort)) {
      Config.kubernetesProxyPort = defaultKubernetesProxyPort;
      logger.info(`Kubernetes api server port set to: ${Config.kubernetesProxyPort}`);
    }

    Config.mode = options.mode || 'swarm'; // swarm is the default value
    if (Config.mode !== 'local' && Config.mode !== 'swarm' && Config.mode !== 'kubernetes') {
      logger.error('Incorrect operation mode. Use --mode option.');
      process.exit(1);
    }
    logger.info(`Mira is running in ${Config.mode} mode`);

    /**
     * If true the process is expected to run outside of docker communicating with engines
     * public ports.
     * @type {boolean}
     */
    Config.devMode = process.env.DEV_MODE;
    logger.info(`Mira is running in ${Config.devMode ? 'dev' : 'production'} mode`);
  }
}

module.exports = Config;
