const logger = require('./logger/Logger').get();

const defaultMiraPort = 9100;
const defaultQixEnginePort = 9076;
const defaultEngineDiscoveryRefreshRate = 1000;
const defaultEngineHealthRefreshRate = 5000;
const defaultKubernetesProxyPort = 8001;
const defaultDiscoveryId = 'qix-engine';
const defaultEngineAPIPortLabel = 'qix-api-port';

/**
 * Class representing the configuration options for running the service.
 */
class Config {
  /**
   * Initializes the configuration.
   * This method must be called before any of the static properties of the class are available.
   * @param {object} commandLineOptions - Options passed as command line arguments when starting
   *   the service.
   */
  static init(commandLineOptions) {
    const options = commandLineOptions || {};

    /**
     * @prop {number} miraPort - The port that Mira exposes its REST API on.
     * @static
     */
    Config.miraPort = parseInt(process.env.PORT, 10);
    if (!Config.miraPort || isNaN(Config.miraPort)) {
      Config.miraPort = defaultMiraPort;
      logger.info(`Mira port set to: ${Config.miraPort}`);
    }

    /**
     * @prop {string[]} discoveryIds - Array of identifiers used to discover QIX Engine Docker
     *   instances. It is assumed that engines are labeled accordingly with the miraDiscoveryId
     *   label key.
     * @static
     */
    Config.discoveryIds = (process.env.DISCOVERY_IDS || defaultDiscoveryId).replace(/\s+/g, '').split(',');

    /**
     * @prop {number} enginePort - The port to use for communicating with the QIX Engine.
     * @static
     */
    Config.enginePort = parseInt(process.env.QIX_ENGINE_PORT, 10);
    if (!Config.enginePort || isNaN(Config.enginePort)) {
      Config.enginePort = defaultQixEnginePort;
      logger.info(`Engine port set to: ${Config.enginePort}`);
    }

    /**
     * @prop {string} engineAPIPortLabel - The port to use for communicating
     *                                     with the QIX Engine if no port label has been found.
     * @static
     */
    Config.engineAPIPortLabel = process.env.QIX_ENGINE_API_PORT_LABEL;
    if (!Config.engineAPIPortLabel) {
      Config.engineAPIPortLabel = defaultEngineAPIPortLabel;
    }
    logger.info(`Engine API port label set to: ${Config.engineAPIPortLabel}`);

    /**
     * @prop {number} engineDiscoveryRefreshRate - The engine discovery refresh rate in
     *   milliseconds. This is how often Mira triggers engine discovery scans towards the system to
     *   detect new or removed engine instaces.
     * @static
     */
    Config.engineDiscoveryRefreshRate = parseInt(process.env.ENGINE_DISCOVERY_REFRESH_RATE_MS, 10);
    if (!Config.engineDiscoveryRefreshRate || isNaN(Config.engineDiscoveryRefreshRate)) {
      Config.engineDiscoveryRefreshRate = defaultEngineDiscoveryRefreshRate;
      logger.info(`Discovery refresh rate set to: ${Config.engineDiscoveryRefreshRate}`);
    }

    /**
     * @prop {number} engineHealthRefreshRate - The health check refresh rate in milliseconds.
     * @static
     */
    Config.engineHealthRefreshRate = parseInt(process.env.ENGINE_HEALTH_REFRESH_RATE_MS, 10);
    if (!Config.engineHealthRefreshRate || isNaN(Config.engineHealthRefreshRate)) {
      Config.engineHealthRefreshRate = defaultEngineHealthRefreshRate;
      logger.info(`Health check refresh rate set to: ${Config.engineHealthRefreshRate}`);
    }

    /**
     * @prop {number} kubernetesProxyPort - The proxy port to the Kubernetes API server used in
     *   kubernetes mode.
     * @static
     */
    Config.kubernetesProxyPort = parseInt(process.env.KUBERNETES_PROXY_PORT, 10);
    if (!Config.kubernetesProxyPort || isNaN(Config.kubernetesProxyPort)) {
      Config.kubernetesProxyPort = defaultKubernetesProxyPort;
      logger.info(`Kubernetes api server port set to: ${Config.kubernetesProxyPort}`);
    }

    /**
     * @prop {string} mode - The operation mode of mira which can be 'local' or 'swarm'.
     * @static
     */
    Config.mode = options.mode || 'swarm'; // swarm is the default value
    if (Config.mode !== 'local' && Config.mode !== 'swarm' && Config.mode !== 'kubernetes') {
      logger.error('Incorrect operation mode. Use --mode option.');
      process.exit(1);
    }
    logger.info(`Mira is running in ${Config.mode} mode`);

    /**
     * @prop {boolean} devMode - If true the process is expected to run outside of docker
     *   communicating with engines public ports.
     * @static
     */
    Config.devMode = process.env.DEV_MODE ? process.env.DEV_MODE.toLowerCase() === 'true' : false;
    logger.info(`Mira is running in ${Config.devMode ? 'dev' : 'production'} mode`);
  }
}

module.exports = Config;
