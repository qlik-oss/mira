const JSONUtils = require('./utils/JSONUtils');

/**
 * Helper for periodical health checking.
 */
async function checkHealth(entry, healthFetcher, ms) {
  /* eslint-disable no-param-reassign */
  try {
    const health = await healthFetcher.fetch(entry.ipAddress, entry.port, '/healthcheck');
    JSONUtils.flatten(health, '', entry.properties);
    entry.properties.healthy = true;
  } catch (err) {
    // eslint-disable-next-line
    console.log(err);
    entry.properties.healthy = false;
  }
  entry.fetcherTimeOutId = setTimeout(checkHealth, ms, entry, healthFetcher, ms);
  /* eslint-enable no-param-reassign */
}

/**
 * Engine entry class definition.
 * @prop {object} properties - Properties of the engine instance.
 * @prop {string} ipAddress - The IP address of the engine.
 * @prop {number} port - The port of the engine.
 */
class EngineEntry {
  /**
   * Creates new {@link EngineEntry} object.
   * @param {*} properties
   * @param {*} ipAddress
   * @param {*} port
   */
  constructor(properties, ipAddress, port) {
    this.properties = properties;
    this.ipAddress = ipAddress;
    this.port = port;
    this.fetcherTimeOutId = null;
  }

  /**
   * Starts periodical health checking.
   * @param {EngineHealthFetcher} healthFetcher - The engine health fetcher to use.
   * @param {number} ms - The interval in milliseconds between health checks.
   */
  startHealthChecks(healthFetcher, ms) {
    if (this.fetcherTimeOutId != null) {
      this.stopHealthChecks();
    }
    this.fetcherTimeOutId = setTimeout(checkHealth, ms, this, healthFetcher, ms);
  }

  /**
   * Stops periodical health checking.
   */
  stopHealthChecks() {
    if (this.fetcherTimeOutId != null) {
      clearTimeout(this.fetcherTimeOutId);
      this.fetcherTimeOutId = null;
    }
  }
}

module.exports = EngineEntry;
