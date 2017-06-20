// const logger = require('./logger/Logger').get();
const Config = require('./Config');
const EngineList = require('./EngineList');

/**
 * Engine entry class definition.
 * @typedef {object} EngineEntry
 * @prop {object} properties - Properties of the engine instance.
 * @prop {string} ipAddress - The IP address of the engine.
 * @prop {number} port - The port of the engine.
 * @prop {number} [publicPort] - The public port, if the engine is reachable on it.
 * @prop {Network[]} networks - Array of networks the engine is attached to.
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
   */
  constructor(DockerClient) {
    this.DockerClient = DockerClient;
    this.engineList = new EngineList();

    // Temporary refresh
    setInterval(() => this.refresh(), 1000);
  }

  /**
   * Lists available engine instances.
   * @returns {Promise<EngineEntry[]>} Promise to an array of engine entries.
   */
  async refresh() {
    const engines = await this.DockerClient.listEngines(Config.engineImageName);
    engines.forEach((engine) => {
      if (!this.engineList.exists(engine)) {
        this.engineList.add(engine);
      }
    });
  }

  async list() {
    const engines = this.engineList.all();
    return engines.map(engine => ({
      properties: engine.properties,
      ipAddress: engine.ipAddress,
      port: engine.port
    }));
  }

  /**
   * Queries available engine instances fullfilling the provided set of properties.
   * @param {object} properties - The properties a returned engine must have.
   * @returns {Promise<EngineEntry[]>} Promise to an array of engine entries that have the required properties.
   */
  async query(properties = []) {
    // Allow both single properties object and array
    if (!Array.isArray(properties)) {
      // eslint-disable-next-line no-param-reassign
      properties = [properties];
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const i in properties) {
      const requiredProperties = properties[i];
      const matches = this.engineList.filter(requiredProperties);
      if (matches.length > 0) {
        return matches;
      }
    }
    return [];
  }
}

module.exports = EngineDiscovery;
