const EngineMap = require('./EngineMap');
const EngineEntry = require('./EngineEntry');
const logger = require('./logger/Logger').get();

/**
 * Engine container return specification.
 * @typedef {object} EngineReturnSpec
 * @prop {object} engine - Properties of the engine container.
 * @prop {string} engine.ip - Internal IP address to the engine container.
 * @prop {number} engine.port - API port of the engine container.
 * @prop {number} engine.metricsPort - Metrics port of the engine container.
 * @prop {object} local - Complete container response if running in local docker mode, otherwise undefined.
 * @prop {object} swarm - Complete container response if running in docker swarm mode, otherwise undefined.
 * @prop {object} kubernetes - Complete container response if running in kubernetes mode, otherwise undefined.
 */

/**
 * Discovers engines and sets the timeout for periodical refreshing.
 */
async function discover() {
  const engines = await this.OrchestrationClient.listEngines();
  const keys = engines.map(engine => engine.key);
  const keysToDelete = this.engineMap.difference(keys);
  keysToDelete.forEach((key) => {
    logger.info(`Engine removed: ${key}`);
  });
  this.engineMap.delete(this.engineMap.difference(keys));
  engines.forEach((item) => {
    if (!this.engineMap.has(item.key)) {
      const engineEntry = new EngineEntry(
        item, this.healthRefreshRate);
      logger.info(`Engine discovered at address: ${engineEntry.properties.engine.ip}:${engineEntry.properties.engine.port} with key: ${item.key}`);
      this.engineMap.add(item.key, engineEntry);
    }
  });
  setTimeout(() => discover.call(this), this.discoveryRefreshRate);
}

/**
 * Class providing engine discovery operations such as to list available engine instances and
 * query for engine instances with certain properties.
 */
class EngineDiscovery {
  /**
   * Creates new {@link EngineDiscovery} object.
   * @param {OrchestrationClient} OrchestrationClient - The Docker client implementation used to list engines.
   * @param {number} discoveryRefreshRate - The engine discovery refresh rate in milliseconds.
   * @param {number} healthRefreshRate - The health check refresh rate in milliseconds.
   */
  constructor(OrchestrationClient, discoveryRefreshRate, healthRefreshRate) {
    this.OrchestrationClient = OrchestrationClient;
    this.discoveryRefreshRate = discoveryRefreshRate;
    this.healthRefreshRate = healthRefreshRate;
    this.engineMap = new EngineMap();

    // Start discovery!
    discover.call(this);
  }

  /**
   * Lists available engine instances.
   * @param {boolean} full - If true return a verbose list of engines and orchestration info.
   * @returns {Promise<EngineReturnSpec[]>} Promise to an array of engines.
   */
  async list(full) {
    const engines = this.engineMap.all();

    if (full) {
      return engines.map(item => ({
        engine: item.properties.engine,
        local: item.properties.local,
        swarm: item.properties.swarm,
        kubernetes: item.properties.kubernetes,
      }));
    }

    return engines.map(item => ({
      engine: {
        ip: item.properties.engine.ip,
        port: item.properties.engine.port,
        metricsPort: item.properties.engine.metricsPort,
        status: item.properties.engine.status,
      },
    }));
  }
}

module.exports = EngineDiscovery;
