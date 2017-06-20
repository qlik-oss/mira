const logger = require('./logger/Logger').get();
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

function flattenStructureIntoProperties(object, prefix, output) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in object) {
    const value = object[key];
    if (value instanceof Object && !Array.isArray(value)) {
      flattenStructureIntoProperties(value, `${key}.`, output);
    } else {
      // eslint-disable-next-line no-param-reassign
      output[prefix + key] = value;
    }
  }
}

/**
 * Class providing engine discovery operations such as to list available engine instances and
 * query for engine instances with certain properties.
 */
class EngineDiscovery {
  /**
   * Creates new {@link EngineDiscovery} object.
   * @param {DockerClient} DockerClient - The Docker client implementation used to list engines.
   * @param {EngineHealthFetcher} EngineHealthFetcher - Engine health fetcher implementation used to determine engine health status.
   */
  constructor(DockerClient, EngineHealthFetcher) {
    this.DockerClient = DockerClient;
    this.EngineHealthFetcher = EngineHealthFetcher;
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
    const completeEngines = await Promise.all(engines.map(async (engine) => {
      try {
        const health = await this.EngineHealthFetcher.fetch(engine);
        flattenStructureIntoProperties(health, '', engine.properties);
        // eslint-disable-next-line no-param-reassign
        engine.properties.healthy = true;
      } catch (err) {
        // eslint-disable-next-line no-param-reassign
        engine.properties.healthy = false;
        logger.warn('Healthcheck failed for engine', engine, err);
      }
      return engine;
    }));

    completeEngines.forEach((engine) => {
      if (!this.engineList.exists(engine)) {
        this.engineList.add(engine);
      }
    });
  }

  async list() {
    return this.engineList.all();
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
