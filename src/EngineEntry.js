const logger = require('./logger/Logger').get();
const EngineHealthFetcher = require('./EngineHealthFetcher');

/**
 * Helper for periodical health checking.
 * An {@link EngineEntry} object must be bound as this before calling.
 */
async function checkHealth() {
  try {
    const health = await this.healthFetcher.fetch(this.properties.engine.ip, this.properties.engine.port, '/healthcheck');
    this.properties.engine.health = health;
    this.properties.engine.lastRefreshed = new Date().toISOString();
  } catch (err) {
    logger.warn(`Engine health check failed on ${this.properties.engine.ip}:${this.properties.engine.port}`);
    this.properties.engine.health = undefined;
  }
  this.fetcherTimeOutId = setTimeout(checkHealth.bind(this), this.refreshRate);
}

/**
 * Engine entry class definition.
 * @prop {object} properties - Properties of the engine instance.
 * @prop {number} refreshRate - The health check refresh rate in milliseconds.
 * @prop {EngineHealthFetcher} healthFetcher - The health fetcher to use.
 *   Optional and mainly used for testing; if not supplied, a default
 *   implementation will be used.
 */
class EngineEntry {
  /**
   * Creates new {@link EngineEntry} object.
   * @param {object} properties - Properties of the engine instance.
   * @param {number} refreshRate - The health check refresh rate in milliseconds.
   * @param {EngineHealthFetcher} healthFetcher - The helth fetcher to use.
   *   Optional and mainly used for testing; if not supplied, a default
   *   implementation will be used.
   */
  constructor(properties, refreshRate, healthFetcher) {
    this.properties = properties;
    this.refreshRate = refreshRate;
    this.healthFetcher = healthFetcher || new EngineHealthFetcher();
  }

  /**
   * Starts periodical health checking.
   */
  startHealthChecks() {
    this.stopHealthChecks();
    checkHealth.call(this);
  }

  /**
   * Stops periodical health checking.
   */
  stopHealthChecks() {
    clearTimeout(this.fetcherTimeOutId);
  }
}

module.exports = EngineEntry;
