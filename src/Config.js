const defaultMiraApiPort = 9100;
const defaultEngineAPIPort = 9076;
const defaultEngineMetricsPort = 9090;
const defaultEngineDiscoveryInterval = 10000;
const defaultEngineUpdateInterval = 10000;
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
    if (!Config.miraApiPort || Number.isNaN(Config.miraApiPort)) {
      Config.miraApiPort = defaultMiraApiPort;
    }

    /**
     * @prop {string} discoveryLabel - Label used to discover Qlik Associative Engine instances.
     * @static
     */
    Config.discoveryLabel = process.env.MIRA_DISCOVERY_LABEL
      ? process.env.MIRA_DISCOVERY_LABEL.trim() : defaultDiscoveryLabel;

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

    /**
     * @prop {number} engineDiscoveryInterval - The engine discovery interval in
     *   milliseconds. This is how often Mira triggers engine discovery scans towards the system to
     *   detect new or removed engine instaces.
     * @static
     */
    Config.engineDiscoveryInterval = parseInt(process.env.MIRA_ENGINE_DISCOVERY_INTERVAL, 10);
    if (!Config.engineDiscoveryInterval || Number.isNaN(Config.engineDiscoveryInterval)) {
      Config.engineDiscoveryInterval = defaultEngineDiscoveryInterval;
    }

    /**
     * @prop {number} engineUpdateInterval - The engine health and metrics update interval in milliseconds.
     * @static
     */
    Config.engineUpdateInterval = parseInt(process.env.MIRA_ENGINE_UPDATE_INTERVAL, 10);
    if (!Config.engineUpdateInterval || Number.isNaN(Config.engineUpdateInterval)) {
      Config.engineUpdateInterval = defaultEngineUpdateInterval;
    }

    /**
     * @prop {number} kubernetesProxyPort - The proxy port to the Kubernetes API server used in
     *   kubernetes mode.
     * @static
     */
    Config.kubernetesProxyPort = parseInt(process.env.MIRA_KUBERNETES_PROXY_PORT, 10);
    if (!Config.kubernetesProxyPort || Number.isNaN(Config.kubernetesProxyPort)) {
      Config.kubernetesProxyPort = defaultKubernetesProxyPort;
    }

    /**
     * @prop {string} mode - The operation mode of mira which can be 'local' or 'swarm'.
     * @static
     */
    Config.mode = process.env.MIRA_MODE || 'swarm'; // swarm is the default value
    const SUPPORTED_MODES = ['local', 'swarm', 'kubernetes', 'dns', 'none'];
    if (SUPPORTED_MODES.indexOf(Config.mode) === -1) {
      throw new Error(`Incorrect operation mode. Supported modes are: ${SUPPORTED_MODES.join(', ')}`);
    }

    /**
     * @prop {string} kubernetesTargetNamespace - The namespace to target when looking for engines
     * @static
     */
    Config.kubernetesTargetNamespace = process.env.MIRA_KUBERNETES_TARGET_NAMESPACE
      ? process.env.MIRA_KUBERNETES_TARGET_NAMESPACE.trim() : null;

    /**
     * @prop {boolean} containerized - If mira is running inside a docker container or not.
     * @static
     */
    Config.containerized = process.env.MIRA_CONTAINERIZED && process.env.MIRA_CONTAINERIZED.toLowerCase() === 'true';


    /**
     * @prop {string} discoveryHostname - The hostname mira will use for querying engines in dns mode
     * @static
     */
    Config.discoveryHostname = process.env.MIRA_DISCOVERY_HOSTNAME;
    if (Config.mode === 'dns' && !Config.discoveryHostname) {
      throw new Error('Running Mira in dns mode requires the mira discovery hostname (MIRA_DISCOVERY_HOSTNAME) to be set');
    }

    /**
     * @prop {string} rollbarToken - The rollbar cloud access token used for error reporting.
     * @static
     */
    Config.rollbarToken = process.env.MIRA_ROLLBAR_ACCESS_TOKEN || null;

    /**
     * @prop {string} rollbarLevels - The log level(s) that should be reported to rollbar.
     * @static
     */
    if (Config.rollbarToken) {
      // e.g. `MIRA_ROLLBAR_LEVELS=warning,error`
      Config.rollbarLevels = (process.env.MIRA_ROLLBAR_LEVELS || 'error').split(',');
    }

    /**
     * @prop {string} engineNetworks - Docker networks Mira should use for status checking. Only applicable in swarm mode.
     * @static
     */
    const networks = process.env.MIRA_SWARM_ENGINE_NETWORKS;
    if (Config.mode === 'swarm' && networks) {
      // e.g. `MIRA_SWARM_ENGINE_NETWORKS=default_network,engine_network`
      Config.engineNetworks = networks.split(',');
    }
  }

  /**
   * Returns an object with the configured properties
  */
  static getConfiguration() {
    const configuration = {};
    Object.keys(Config).forEach((key) => {
      const val = Config[key];
      if (val) {
        configuration[key] = val;
      }
    });
    return configuration;
  }
}

module.exports = Config;
