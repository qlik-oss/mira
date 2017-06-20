// Temporary typedef if EngineEntry, will be replaced by the apropriate class.
/**
 * Engine entry class definition.
 * @typedef {object} EngineEntry
 * @prop {object} properties - Properties of the engine instance.
 * @prop {string} ipAddress - The IP address of the engine.
 * @prop {number} port - The port of the engine.
 * @prop {number} [publicPort] - The public port, if the engine is reachable on it.
 * @prop {Network[]} networks - Array of networks the engine is attached to.
 */

const key = engine => `${engine.ipAddress}:${engine.port}`;

function filterEnginesBasedOnProperties(allEngines, requiredProperties) {
  return allEngines.filter((engine) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const k in requiredProperties) {
      const actual = engine.properties[k];
      const expected = requiredProperties[k];

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
 * Class providing a central repository for discovered QIX engine instances.
 */
class EngineList {

  /**
   * Creates new {@link EngineList}.
   */
  constructor() {
    this.entries = {};
  }

  /**
   * Adds an engine to the list.
   * @param {EngineEntry} the engine entry to add.
   */
  add(engine) {
    this.entries[key(engine)] = engine;
  }

  /**
   * Checks if a given engine is already in the list.
   * @param {EngineEntry} the engine entry.
   * @returns true if engine is already in list, false otherwise.
   */
  exists(engine) {
    return Object.prototype.hasOwnProperty.call(this.entries.hasOwnProperty, key(engine));
  }

  all() {
    return Object.keys(this.entries).map(k => this.entries[k]);
  }

  filter(properties) {
    const engines = this.all();
    return filterEnginesBasedOnProperties(engines, properties);
  }

  /**
   * Deletes the given engine entry.
   * @param {EngineEntry} engine
   */
  remove(engine) {
    delete this.entries[key(engine)];
  }
}

module.exports = EngineList;
