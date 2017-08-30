const logger = require('./logger/Logger').get();

const defaultMiraApiPort = 9100;
const defaultQixEnginePort = 9076;
const defaultEngineDiscoveryRefreshRate = 1000;
const defaultEngineHealthRefreshRate = 5000;
const defaultKubernetesProxyPort = 8001;
const defaultDiscoveryLabel = 'qix-engine';
const defaultEngineAPIPortLabel = 'qix-engine-port';

/**
 * Class representing the configuration options for running the service.
 */
class Config {
  /**
   * Initializes the configuration.
   * This method must be called before any of the static properties of the class are available.
   */
  static init() {
    /**
     * @prop {number} miraApiPort - The TCP port the service shall expose its API on.
     * @static
     */
    Config.miraApiPort = parseInt(process.env.MIRA_API_PORT, 10);
    if (!Config.miraApiPort || isNaN(Config.miraApiPort)) {
      Config.miraApiPort = defaultMiraApiPort;
    }
    logger.info(`Mira API port set to: ${Config.miraApiPort}`);

    /**
     * @prop {string} discoveryLabel - Label used to discover QIX Engine instances.
     * @static
     */
    Config.discoveryLabel = process.env.MIRA_DISCOVERY_LABEL ?
      process.env.MIRA_DISCOVERY_LABEL.trim() : defaultDiscoveryLabel;
    logger.info(`Discovery label set to: ${Config.discoveryLabel}`);

    /**
     * @prop {number} enginePort - The port to use for communicating with the QIX Engine.
     * @static
     */
    Config.enginePort = parseInt(process.env.MIRA_ENGINE_API_PORT, 10);
    if (!Config.enginePort || isNaN(Config.enginePort)) {
      Config.enginePort = defaultQixEnginePort;
    }
    logger.info(`Engine port set to: ${Config.enginePort}`);

    /**
     * @prop {string} engineAPIPortLabel - The port to use for communicating
     *                                     with the QIX Engine if no port label has been found.
     * @static
     */
    Config.engineAPIPortLabel = process.env.MIRA_ENGINE_API_PORT_LABEL;
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
    Config.engineDiscoveryRefreshRate = parseInt(process.env.MIRA_ENGINE_DISCOVERY_REFRESH_RATE, 10);
    if (!Config.engineDiscoveryRefreshRate || isNaN(Config.engineDiscoveryRefreshRate)) {
      Config.engineDiscoveryRefreshRate = defaultEngineDiscoveryRefreshRate;
    }
    logger.info(`Discovery refresh rate set to: ${Config.engineDiscoveryRefreshRate}`);

    /**
     * @prop {number} engineHealthRefreshRate - The health check refresh rate in milliseconds.
     * @static
     */
    Config.engineHealthRefreshRate = parseInt(process.env.MIRA_ENGINE_HEALTH_REFRESH_RATE, 10);
    if (!Config.engineHealthRefreshRate || isNaN(Config.engineHealthRefreshRate)) {
      Config.engineHealthRefreshRate = defaultEngineHealthRefreshRate;
    }
    logger.info(`Health check refresh rate set to: ${Config.engineHealthRefreshRate}`);

    /**
     * @prop {number} kubernetesProxyPort - The proxy port to the Kubernetes API server used in
     *   kubernetes mode.
     * @static
     */
    Config.kubernetesProxyPort = parseInt(process.env.MIRA_KUBERNETES_PROXY_PORT, 10);
    if (!Config.kubernetesProxyPort || isNaN(Config.kubernetesProxyPort)) {
      Config.kubernetesProxyPort = defaultKubernetesProxyPort;
    }
    logger.info(`Kubernetes api server port set to: ${Config.kubernetesProxyPort}`);

    /**
     * @prop {string} mode - The operation mode of mira which can be 'local' or 'swarm'.
     * @static
     */
    Config.mode = process.env.MIRA_MODE || 'swarm'; // swarm is the default value
    if (Config.mode !== 'local' && Config.mode !== 'swarm' && Config.mode !== 'kubernetes') {
      logger.error('Incorrect operation mode. Supported modes are "local", "swarm" and "kubernetes"');
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
