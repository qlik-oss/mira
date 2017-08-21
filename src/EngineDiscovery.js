const Config = require('./Config');
const EngineMap = require('./EngineMap');
const EngineEntry = require('./EngineEntry');

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
 * Class providing engine discovery operations such as to list available engine instances and
 * query for engine instances with certain properties.
 */
class EngineDiscovery {
  /**
   * Creates new {@link EngineDiscovery} object.
   * @param {DockerClient} DockerClient - The Docker client implementation used to list engines.
   * @param {number} discoveryRefreshRate - The engine discovery refresh rate in
   *  milliseconds.
   * @param {number} healthRefreshRate - The health check refresh rate in milliseconds.
   */
  constructor(
    DockerClient,
    discoveryRefreshRate,
    healthRefreshRate) {
    this.DockerClient = DockerClient;
    this.engineMap = new EngineMap();

    // Start discovery!
    this.refresh(discoveryRefreshRate, healthRefreshRate);
  }

  /**
   * Refreshes the list of discovered engines and sets the timeout for periodical refreshing.
   * NOTE: This method shall not be called externally. It is only intended to be called from
   * the constructor.
   */
  async refresh(discoveryRefreshRate, healthRefreshRate) {
    const engines = await this.DockerClient.listEngines(Config.engineImageName);
    const keys = engines.map(engine => engine.key);
    this.engineMap.delete(this.engineMap.difference(keys));
    engines.forEach((engine) => {
      if (!this.engineMap.has(engine.key)) {
        const engineEntry = new EngineEntry(
          engine.properties, engine.ipAddress, engine.port, healthRefreshRate);
        this.engineMap.add(engine.key, engineEntry);
      }
    });
    setTimeout(this.refresh.bind(this), discoveryRefreshRate);
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
