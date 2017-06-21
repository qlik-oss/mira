const http = require('http');
const EventEmitter = require('events');
const EngineHealthFetcher = require('./EngineHealthFetcher');
const flattenStructureIntoProperties = require('./utils/JSONUtils');

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
        flattenStructureIntoProperties(health, '', this.properties);
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
   * 
   */
  stopHealthChecks() {
    if (this.fetcherTimeOutId) {
      clearTimeout(this.fetcherTimeOutId);
    }
  }

}

module.exports = EngineEntry;
