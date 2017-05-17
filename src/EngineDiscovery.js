const logger = require('./logger/Logger').get();
const Config = require('./Config');

/**
 * Engine entry class definition.
 * @typedef {Object} EngineEntry
 * @prop {Object} properties - Properties of the engine instance.
 * @prop {string} ipAddress - The IP address of the engine.
 * @prop {number} port - The port of the engine.
 * @prop {number} [publicPort] - The public port, if the engine is reachable on it.
 * @prop {Network[]} networks - Array of networks the engine is attached to.
 */

/**
 * Network class definition.
 * @typedef {Object} Network
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

function filterEnginesBasedOnProperties(allEngines, requiredProperties) {
  return allEngines.filter((engine) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in requiredProperties) {
      const actual = engine.properties[key];
      const expected = requiredProperties[key];

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
  });
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
  }

  /**
   * Lists available engine instances.
   * @returns {Promise<EngineEntry[]>} Promise to an array of engine entries.
   */
  async list() {
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
    return completeEngines;
  }

  /**
   * Queries available engine instances fullfilling the provided set of properties.
   * @param {Object} properties - The properties a returned engine must have.
   * @returns {Promise<EngineEntry[]>} Promise to an array of engine entries that have the required properties.
   */
  async query(properties) {
    // Allow both single properties object and array
    if (!Array.isArray(properties)) {
      // eslint-disable-next-line no-param-reassign
      properties = [properties];
    }
    const allEngines = await this.list();
    // eslint-disable-next-line no-restricted-syntax
    for (const i in properties) {
      const requiredProperties = properties[i];
      const matches = filterEnginesBasedOnProperties(allEngines, requiredProperties);
      if (matches.length > 0) {
        return matches;
      }
    }
    return [];
  }
}

module.exports = EngineDiscovery;
