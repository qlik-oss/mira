const logger = require('./logger/Logger').get();
const EngineHealthFetcher = require('./EngineHealthFetcher');
const JSONUtils = require('./utils/JSONUtils');

/**
 * Helper for periodical health checking.
 * An {@link EngineEntry} object must be bound as this before calling.
 */
async function checkHealth() {
  try {
    const health = await this.healthFetcher.fetch(this.ipAddress, this.port, '/healthcheck');
    JSONUtils.flatten(health, this.properties.engine.health);
  } catch (err) {
    logger.warn(`Engine health check failed on ${this.ipAddress}:${this.port}`);
    this.properties.engine.health = undefined;
  }
  this.fetcherTimeOutId = setTimeout(checkHealth.bind(this), this.refreshRate);
}

/**
 * Engine entry class definition.
 * @prop {object} properties - Properties of the engine instance.
 * @prop {string} ipAddress - The IP address of the engine.
 * @prop {number} port - The port of the engine.
 * @prop {number} refreshRate - The health check refresh rate in milliseconds.
 * @prop {EngineHealthFetcher} healthFetcher - The health fetcher to use.
 *   Optional and mainly used for testing; if not supplied, a default
 *   implementation will be used.
 */
class EngineEntry {
  /**
   * Creates new {@link EngineEntry} object.
   * @param {object} properties - Properties of the engine instance.
   * @param {string} ipAddress - The IP address of the engine.
   * @param {number} port - The port of the engine.
   * @param {number} refreshRate - The health check refresh rate in milliseconds.
   * @param {EngineHealthFetcher} healthFetcher - The helth fetcher to use.
   *   Optional and mainly used for testing; if not supplied, a default
   *   implementation will be used.
   */
  constructor(properties, ipAddress, port, refreshRate, healthFetcher) {
    this.properties = properties;
    this.ipAddress = ipAddress;
    this.port = port;
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

  /**
   * Checks if the properties of the engine {@link EngineEntry#properties} satisfies the property
   * constraints given by the parameter.
   * @param {object} constraints - Property constraints checked.
   * @returns {boolean} True, if the constraints are satisfied.
   */
  satisfies(constraints) {
    let retval = true;
    const keys = Object.keys(constraints);

    keys.forEach((key) => {
      if (retval) {
        const expected = constraints[key];
        const actual = this.properties[key];

        if (typeof actual === 'undefined') {
          retval = false;
        } else if (Array.isArray(expected)) {
          retval = (expected.indexOf(actual) !== -1);
        } else if (typeof expected === 'boolean' || typeof actual === 'boolean') {
          retval = expected.toString().toLowerCase() === actual.toString().toLowerCase();
        } else if ((typeof expected === 'string')
          && (expected.indexOf('>') === 0)
          && !isNaN(expected.substring(1))) {
          const expectedNumber = expected.substring(1);
          retval = (actual > expectedNumber);
        } else if (typeof expected === 'string' &&
          expected.indexOf('<') === 0 &&
          !isNaN(expected.substring(1))) {
          const expectedNumber = expected.substring(1);
          retval = actual < expectedNumber;
          // eslint-disable-next-line eqeqeq
        } else if (actual != expected) {
          retval = false;
        }
      }
    });

    return retval;
  }
}

module.exports = EngineEntry;
