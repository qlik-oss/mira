const logger = require('./logger/Logger').get();

const defaultMiraApiPort = 9100;
const defaultEngineAPIPort = 9076;
const defaultEngineMetricsPort = 9090;
const defaultEngineDiscoveryInterval = 10000;
const defaultEngineUpdateInterval = 10000;
const defaultKubernetesProxyPort = 8001;
const defaultAllowedResponseTimeSeconds = 1;
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
     * @prop {string} discoveryLabel - Label used to discover Qlik Associative Engine instances.
     * @static
     */
    Config.discoveryLabel = process.env.MIRA_DISCOVERY_LABEL ?
      process.env.MIRA_DISCOVERY_LABEL.trim() : defaultDiscoveryLabel;
    logger.info(`Discovery label set to: ${Config.discoveryLabel}`);

    /**
     * @prop {number} defaultEngineAPIPort - The default port to use for communicating with the Qlik Associative Engine,
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
     * @prop {number} defaultEngineMetricsPort - The default port to use for retrieving the Qlik Associative Engine metrics,
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
    logger.info(`Qlik Associative Engine Metrics port label set to: ${Config.engineMetricsPortLabel}`);

    /**
     * @prop {number} engineDiscoveryInterval - The engine discovery interval in
     *   milliseconds. This is how often Mira triggers engine discovery scans towards the system to
     *   detect new or removed engine instaces.
     * @static
     */
    Config.engineDiscoveryInterval = parseInt(process.env.MIRA_ENGINE_DISCOVERY_INTERVAL, 10);
    if (!Config.engineDiscoveryInterval || isNaN(Config.engineDiscoveryInterval)) {
      Config.engineDiscoveryInterval = defaultEngineDiscoveryInterval;
    }
    logger.info(`Qlik Associative Engine discovery interval set to: ${Config.engineDiscoveryInterval}`);

    /**
     * @prop {number} engineUpdateInterval - The engine health and metrics update interval in milliseconds.
     * @static
     */
    Config.engineUpdateInterval = parseInt(process.env.MIRA_ENGINE_UPDATE_INTERVAL, 10);
    if (!Config.engineUpdateInterval || isNaN(Config.engineUpdateInterval)) {
      Config.engineUpdateInterval = defaultEngineUpdateInterval;
    }
    logger.info(`Qlik Associative Engine update interval set to: ${Config.engineUpdateInterval}`);

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
    const SUPPORTED_MODES = ['local', 'swarm', 'kubernetes', 'dns', 'none'];
    if (SUPPORTED_MODES.indexOf(Config.mode) === -1) {
      throw new Error(`Incorrect operation mode. Supported modes are: ${SUPPORTED_MODES.join(', ')}`);
    }
    logger.info(`Mira is running in ${Config.mode} mode`);

    /**
     * @prop {boolean} containerized - If mira is running inside a docker container or not.
     * @static
     */
    Config.containerized = process.env.MIRA_CONTAINERIZED && process.env.MIRA_CONTAINERIZED.toLowerCase() === 'true';
    logger.info(`Mira is ${Config.containerized ? '' : 'not '}running inside a docker container`);


    /**
     * @prop {string} discoveryHostname - The hostname mira will use for querying engines in dns mode
     * @static
     */
    Config.discoveryHostname = process.env.MIRA_DISCOVERY_HOSTNAME;
    if (Config.mode === 'dns' && !Config.discoveryHostname) {
      throw new Error('Running Mira in dns mode requires the mira discovery hostname (MIRA_DISCOVERY_HOSTNAME) to be set');
    }
    logger.info(`Mira discovery hostname for dns mode is ${Config.discoveryHostname ? `set to ${Config.discoveryHostname}` : 'not set'}`);

    /**
     * @prop {string} rollbarToken - The rollbar cloud access token used for error reporting.
     * @static
     */
    Config.rollbarToken = process.env.MIRA_ROLLBAR_ACCESS_TOKEN || null;
    logger.info(`Mira is ${Config.rollbarToken ? '' : 'not '}configured to use Rollbar`);

    /**
     * @prop {string} rollbarLevels - The log level(s) that should be reported to rollbar.
     * @static
     */
    if (Config.rollbarToken) {
      // e.g. `MIRA_ROLLBAR_LEVELS=warning,error`
      Config.rollbarLevels = (process.env.MIRA_ROLLBAR_LEVELS || 'error').split(',');
      logger.info(`Mira will report '${Config.rollbarLevels}' log levels to Rollbar`);
    }

    /**
     * @prop {number} allowedResponseTime - The maximum allowed time in seconds from when a request is received by Mira
     * until a response is being sent.
     * @static
     */
    Config.allowedResponseTime = parseInt(process.env.MIRA_ALLOWED_RESPONSE_TIME, 10);
    if (!Config.allowedResponseTime || isNaN(Config.allowedResponseTime)) {
      Config.allowedResponseTime = defaultAllowedResponseTimeSeconds;
    }
    logger.info(`Maximum allowed response time for Mira is: ${Config.allowedResponseTime} second(s)`);

    /**
     * @prop {string} engineNetworks - Docker networks Mira should use for status checking. Only applicable in swarm mode.
     * @static
     */
    const networks = process.env.MIRA_SWARM_ENGINE_NETWORKS;
    if (Config.mode === 'swarm' && networks) {
      // e.g. `MIRA_SWARM_ENGINE_NETWORKS=default_network,engine_network`
      Config.engineNetworks = networks.split(',');
      logger.info(`Mira will use docker networks ${Config.engineNetworks} for status checks`);
    }
  }
}

module.exports = Config;
