const Config = require('./Config');
const EngineMap = require('./EngineMap');
const EngineEntry = require('./EngineEntry');
const logger = require('./logger/Logger').get();

/**
 * Engine container return specification.
 * @typedef {object} EngineReturnSpec
 * @prop {object} properties - Properties of the engine container.
 * @prop {object} ipAddress - IP address on which the engine container can be reached.
 * @prop {number} port - Port number on which the engine container can be reached.
 */

/**
 * Network class definition.
 * @typedef {object} Network
 * @prop {string} name - Network name.
 * @prop {string[]} addresses - Array of IP addresses.
 */

/**
  * Discovers engines and sets the timeout for periodical refreshing.
  */
async function discover() {
  const engines = await this.DockerClient.listEngines(Config.discoveryLabel);
  const keys = engines.map(engine => engine.key);
  const keysToDelete = this.engineMap.difference(keys);
  keysToDelete.forEach((key) => { logger.info(`Engine removed: ${key}`); });
  this.engineMap.delete(this.engineMap.difference(keys));
  engines.forEach((item) => {
    if (!this.engineMap.has(item.key)) {
      const engineEntry = new EngineEntry(
        item, this.healthRefreshRate);
      logger.info(`Engine discovered: ${item.key}`);
      this.engineMap.add(item.key, engineEntry);
    }
  });
  setTimeout(discover.bind(this), this.discoveryRefreshRate);
}

/**
 * Class providing engine discovery operations such as to list available engine instances and
 * query for engine instances with certain properties.
 */
class EngineDiscovery {
  /**
   * Creates new {@link EngineDiscovery} object.
   * @param {DockerClient} DockerClient - The Docker client implementation used to list engines.
   * @param {number} discoveryRefreshRate - The engine discovery refresh rate in milliseconds.
   * @param {number} healthRefreshRate - The health check refresh rate in milliseconds.
   */
  constructor(DockerClient, discoveryRefreshRate, healthRefreshRate) {
    this.discoveryRefreshRate = discoveryRefreshRate;
    this.healthRefreshRate = healthRefreshRate;
    this.DockerClient = DockerClient;
    this.engineMap = new EngineMap();

    // Start discovery!
    discover.call(this);
  }

  /**
   * Lists available engine instances.
   * @returns {Promise<EngineReturnSpec[]>} Promise to an array of engines.
   */
  async list() {
    const engines = this.engineMap.all();

    return engines.map(item => ({
      engine: item.properties.engine,
      local: item.properties.local,
      swarm: item.properties.swarm,
      kubernetes: item.properties.kubernetes,
    }));
  }
}

module.exports = EngineDiscovery;
