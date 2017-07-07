const Config = require('./Config');
const EngineMap = require('./EngineMap');
const EngineEntry = require('./EngineEntry');

/**
 * Engine container return specification.
 * @typedef {object} EngineReturnSpec
 * @prop {string} ipAddress - IP address on which the engine container can be reached.
 * @prop {number} port - Port number on which the engine container can be reached.
 * @prop {string} started
 * @prop {string} version
 * @prop {string} memCommitted
 * @prop {string} memAllocated
 * @prop {string} memFree
 * @prop {string} cpuTotal
 */

/**
 * Network class definition.
 * @typedef {object} Network
 * @prop {string} name - Network name.
 * @prop {string[]} addresses - Array of IP addresses.
 */

const DISCOVERY_REFRESH_RATE_MS = 1000;
const HEALTH_REFRESH_RATE_MS = 5000;

/**
 * Class providing engine discovery operations such as to list available engine instances and
 * query for engine instances with certain properties.
 */
class EngineDiscovery {
  /**
   * Creates new {@link EngineDiscovery} object.
   * @param {DockerClient} DockerClient - The Docker client implementation used to list engines.
   */
  constructor(DockerClient) {
    this.DockerClient = DockerClient;
    this.engineMap = new EngineMap();

    // Start discovery!
    this.refresh();
  }

  /**
   * Lists available engine instances.
   * @returns {Promise<EngineEntry[]>} Promise to an array of engine entries.
   */
  async refresh() {
    const engines = await this.DockerClient.listEngines(Config.engineImageName);
    const keys = engines.map(engine => engine.key);
    this.engineMap.delete(this.engineMap.difference(keys));
    engines.forEach((engine) => {
      if (!this.engineMap.has(engine.key)) {
        const engineEntry = new EngineEntry(
          engine.ipAddress, engine.port, HEALTH_REFRESH_RATE_MS);
        this.engineMap.add(engine.key, engineEntry);
      }
    });
    setTimeout(this.refresh.bind(this), DISCOVERY_REFRESH_RATE_MS);
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
  
  /**
   * Lists available engine instances.
   * @returns {Promise<EngineReturnSpec[]>} Promise to an array of engines.
   */
  async list() {
    let engines = this.engineMap.all();

    return engines.map(engine => ({
      ipAddress: engine.ipAddress,
      port: engine.port,
      started: engine.started,
      version: engine.version,
      memCommitted: engine.memCommited,
      memAllocated: engine.memAllocated,
      memFree: engine.memFree,
      cpuTotal: engine.cpuTotal,
    }));
  }
}

module.exports = EngineDiscovery;
