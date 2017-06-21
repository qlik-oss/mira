const http = require('http');
const EventEmitter = require('events');
const EngineHealthFetcher = require('./EngineHealthFetcher');
const JSONUtils = require('./utils/JSONUtils');

/**
 * Engine health check failed event.
 * @event EngineEntry#healthCheckFailed
 */

/**
 * Engine entry class definition.
 * @prop {object} properties - Properties of the engine instance.
 * @prop {string} ipAddress - The IP address of the engine.
 * @prop {number} port - The port of the engine.
 */
class EngineEntry extends EventEmitter {
  /**
   * Creates new {@link EngineEntry} object.
   * @param {*} properties
   * @param {*} ipAddress
   * @param {*} port
   */
  constructor(properties, ipAddress, port) {
    super();
    this.properties = properties;
    this.ipAddress = ipAddress;
    this.port = port;
    this.healthFetcher = new EngineHealthFetcher(http, ipAddress, port, '/healthcheck');
  }

  /**
   * Starts periodical health checking of the engine instance.
   * @param {number} ms - The interval in milliseconds between health checks.
   * @emits EngineEntry#healthCheckFailed
   */
  startHealthChecks(ms) {
    async function check() {
      try {
        const health = await this.healthFetcher.fetch();
        JSONUtils.flatten(health, '', this.properties);
        this.properties.healthy = true;
      } catch (err) {
        this.properties.healthy = false;
        this.emit('healthCheckFailed');
      }
      this.fetcherTimeOutId = setTimeout(check, ms);
    }
    this.fetcherTimeOutId = setTimeout(check, ms);
  }

  /**
   * Stops periodical health cheking of the engine instance.
   */
  stopHealthChecks() {
    if (this.fetcherTimeOutId) {
      clearTimeout(this.fetcherTimeOutId);
    }
  }

  /**
   * Checks if the properties of the engine {@link EngineEntry#properties} satisfies the property
   * constraints given by the parameter.
   * @param {object} constraints - Property constraints checked.
   * @returns {boolean} True, if the constraints are satisfied.
   */
  satisfies(constraints) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in constraints) {
      const actual = constraints[key];
      const expected = this.properties[key];

      if (Array.isArray(actual)) {
        if (actual.indexOf(expected) === -1) {
          return false;
        }
      } else if (typeof actual === 'boolean' || typeof expected === 'boolean') {
        return actual.toString().toLowerCase() === expected.toString().toLowerCase();
      } else if (expected.indexOf('>') === 0 && !isNaN(expected.substring(1))) {
        const expectedNumber = expected.substring(1);
        if (actual <= expectedNumber) {
          return false;
        }
      } else if (expected.indexOf('<') === 0 && !isNaN(expected.substring(1))) {
        const expectedNumber = expected.substring(1);
        if (actual >= expectedNumber) {
          return false;
        }
        // eslint-disable-next-line eqeqeq
      } else if (expected != actual) {
        return false;
      }
    }
    return true;
  }
}

module.exports = EngineEntry;
