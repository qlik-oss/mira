const Config = require('./Config');
const EngineMap = require('./EngineMap');
const EngineEntry = require('./EngineEntry');
const logger = require('./logger/Logger').get();

/**
 * Engine container return specification.
 * @typedef {object} EngineReturnSpec
 * @prop {object} properties - Properties of the engine container.
 * @prop {string} ipAddress - IP address on which the engine container can be reached.
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
  const engines = await this.DockerClient.listEngines(Config.discoveryIds);
  const keys = engines.map(engine => engine.key);
  const keysToDelete = this.engineMap.difference(keys);
  keysToDelete.forEach((key) => { logger.info(`Engine removed: ${key}`); });
  this.engineMap.delete(this.engineMap.difference(keys));
  engines.forEach((engine) => {
    if (!this.engineMap.has(engine.key)) {
      const engineEntry = new EngineEntry(
        engine.properties, engine.ipAddress, engine.port, this.healthRefreshRate);
      logger.info(`Engine discovered: ${engine.key}`, engine);
      this.engineMap.add(engine.key, engineEntry);
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
   * @param {object} [properties] - Optional properties a returned engine must have.
   * @returns {Promise<EngineReturnSpec[]>} Promise to an array of engines.
   */
  async list(properties) {
    let engines;

    if (!properties) {
      engines = this.engineMap.all();
    } else {
      engines = this.engineMap.filter(properties);
    }

    return engines.map(engine => ({
      properties: engine.properties,
      ipAddress: engine.ipAddress,
      port: engine.port,
    }));
  }
}

module.exports = EngineDiscovery;
