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
   * @param {string} key - The unique key of engine entry to add.
   * @param {EngineEntry} engine - The engine entry to add.
   */
  add(key, engine) {
    if (engine === undefined) { throw new Error('Parameter engine cannot be undefined'); }
    this.entries[key] = engine;
  }

  /**
   * Checks if a given engine is already in the list.
   * @param {EngineEntry} the engine entry.
   * @returns true if engine is already in list, false otherwise.
   */
  exists(key) {
    return this.entries[key] !== undefined;
  }

  /**
   * TODO: Document
   */
  all() {
    return Object.keys(this.entries).map(k => this.entries[k]);
  }

  /**
   * TODO: Document
   * @param {*} properties
   */
  filter(properties) {
    const engines = this.all();
    return filterEnginesBasedOnProperties(engines, properties);
  }

  /**
   * Deletes the given engine entry.
   * @param {string} key
   */
  remove(key) {
    delete this.entries[key];
  }
}

module.exports = EngineList;
