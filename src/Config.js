const logger = require('./logger/Logger').get();

const defaultMiraApiPort = 9100;
const defaultEngineAPIPort = 9076;
const defaultEngineMetricsPort = 9090;
const defaultEngineDiscoveryRefreshRate = 10000;
const defaultEngineHealthRefreshRate = 30000;
const defaultKubernetesProxyPort = 8001;
const defaultDiscoveryLabel = 'qix-engine';
const defaultEngineAPIPortLabel = 'qix-engine-api-port';
const defaultEngineMetricsPortLabel = 'qix-engine-metrics-port';

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
     * @prop {number} defaultEngineAPIPort - The default port to use for communicating with the QIX Engine,
     *   if not defined with MIRA_ENGINE_API_PORT_LABEL.
     * @static
     */
    Config.defaultEngineAPIPort = defaultEngineAPIPort;

    /**
     * @prop {string} engineAPIPortLabel - The label specifying the port to use for communicating with the QIX engine
     * @static
     */
    Config.engineAPIPortLabel = process.env.MIRA_ENGINE_API_PORT_LABEL;
    if (!Config.engineAPIPortLabel) {
      Config.engineAPIPortLabel = defaultEngineAPIPortLabel;
    }
    logger.info(`Engine API port label set to: ${Config.engineAPIPortLabel}`);

    /**
     * @prop {number} defaultEngineMetricsPort - The default port to use for retrieving the QIX Engine metrics,
     *   if not defined with MIRA_ENGINE_METRICS_PORT_LABEL.
     * @static
     */
    Config.defaultEngineMetricsPort = defaultEngineMetricsPort;

    /**
     * @prop {string} engineMetricsPortLabel - The label specifying the port to use for fetching metrics from the QIX engine.
     * @static
     */
    Config.engineMetricsPortLabel = process.env.MIRA_ENGINE_METRICS_PORT_LABEL;
    if (!Config.engineMetricsPortLabel) {
      Config.engineMetricsPortLabel = defaultEngineMetricsPortLabel;
    }
    logger.info(`QIX Engine Metrics port label set to: ${Config.engineMetricsPortLabel}`);

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
    const SUPPORTED_MODES = ['local', 'swarm', 'kubernetes', 'dns'];
    if (SUPPORTED_MODES.indexOf(Config.mode) === -1) {
      throw new Error(`Incorrect operation mode. Supported modes are: ${SUPPORTED_MODES.join(', ')}`);
    }
    logger.info(`Mira is running in ${Config.mode} mode`);

    /**
     * @prop {boolean} containerized - If mira is running inside a docker container or not.
     * @static
     */
    Config.containerized = process.env.MIRA_CONTAINERIZED === 'true' || process.env.MIRA_CONTAINERIZED === 'TRUE';
    logger.info(`Mira is ${Config.containerized ? '' : 'not '}running inside a docker container`);


    /**
     * @prop {string} discoveryHostname - The hostname mira will use for querying engines in dns mode
     * @static
     */
    Config.discoveryHostname = process.env.MIRA_DISCOVERY_HOSTNAME;
    if (Config.mode === 'dns' && !Config.discoveryHostname) {
      throw new Error('Running Mira in dns mode requires the mira discovery hostname (MIRA_DISCOVERY_HOSTNAME) to be set');
    }
    logger.info(`Mira discovery hostname is set to ${Config.discoveryHostname}`);
  }
}

module.exports = Config;
