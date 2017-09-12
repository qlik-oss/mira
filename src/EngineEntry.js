const logger = require('./logger/Logger').get();
const EngineHealthFetcher = require('./EngineHealthFetcher');
const Config = require('./Config');

/**
 * Helper for periodical health checking.
 * An {@link EngineEntry} object must be bound as this before calling.
 */
async function checkStatus() {
  let health;
  let metrics;
  try {
    health = await this.statusFetcher.fetch(this.properties.engine.ip, this.properties.engine.port, '/healthcheck');
    this.properties.engine.health = health;
    metrics = await this.statusFetcher.fetch(this.properties.engine.ip, this.properties.engine.metricsPort, '/metrics');
    this.properties.engine.metrics = metrics;
    this.properties.engine.status = 'OK';
  } catch (err) {
    if (!health) {
      logger.warn(`Engine health check failed on ${this.properties.engine.ip}:${this.properties.engine.port}`);
      this.properties.engine.health = undefined;
      this.properties.engine.status = 'UNHEALTHY';
    } else if (!metrics) {
      logger.warn(`Engine metrics check failed on ${this.properties.engine.ip}:${this.properties.engine.metricsPort}`);
      this.properties.engine.metrics = undefined;
      this.properties.engine.status = 'NO_METRICS';
    }
  }
  this.fetcherTimeOutId = setTimeout(checkStatus.bind(this), this.refreshRate);
}

/**
 * Engine entry class definition.
 * @prop {object} properties - Properties of the engine instance.
 * @prop {number} refreshRate - The status check refresh rate in milliseconds.
 * @prop {EngineHealthFetcher} statusFetcher - The health fetcher to use.
 *   Optional and mainly used for testing; if not supplied, a default
 *   implementation will be used.
 */
class EngineEntry {
  /**
   * Creates new {@link EngineEntry} object.
   * @param {object} properties - Properties of the engine instance.
   * @param {number} refreshRate - The health check refresh rate in milliseconds.
   * @param {EngineHealthFetcher} statusFetcher - The helth fetcher to use.
   *   Optional and mainly used for testing; if not supplied, a default
   *   implementation will be used.
   */
  constructor(properties, refreshRate, statusFetcher) {
    this.properties = properties;
    this.refreshRate = refreshRate;
    this.statusFetcher = statusFetcher || new EngineHealthFetcher();

    // Set api and metrics port of the engine
    const labels = this.properties.labels || {};

    if (labels[Config.engineAPIPortLabel]) {
      this.properties.engine.port = parseInt(labels[Config.engineAPIPortLabel], 10);
    } else {
      logger.info(`Engine entry missing api port label: ${Config.engineAPIPortLabel}, defaulting to port: ${Config.defaultEngineAPIPort}`);
      this.properties.engine.port = Config.defaultEngineAPIPort;
    }

    if (labels[Config.engineMetricsPortLabel]) {
      this.properties.engine.metricsPort = parseInt(labels[Config.engineMetricsPortLabel], 10);
    } else {
      logger.info(`Engine entry missing metrics port label: ${Config.engineMetricsPortLabel}, defaulting to port: ${Config.defaultEngineMetricsPort}`);
      this.properties.engine.metricsPort = Config.defaultEngineMetricsPort;
    }
  }

  /**
   * Starts periodical status checking.
   */
  startStatusChecks() {
    this.stopStatusChecks();
    checkStatus.call(this);
  }

  /**
   * Stops periodical status checking.
   */
  stopStatusChecks() {
    clearTimeout(this.fetcherTimeOutId);
  }
}

module.exports = EngineEntry;
