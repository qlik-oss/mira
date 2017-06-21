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
   * Returns all engines in list.
   * @returns The list of engines.
   */
  all() {
    return Object.keys(this.entries).map(key => this.entries[key]);
  }

  /**
   * Adds an engine to the list.
   * @param {string} key - The unique key of engine entry to add.
   * @param {EngineEntry} engine - The engine entry to add.
   */
  add(key, engine) {
    if (this.has(key)) { throw new Error('Key already exists'); }
    if (!engine) { throw new Error('Invalid engine parameter'); }
    this.entries[key] = engine;
  }

  /**
   * Deletes the given engine entry.
   * @param {string|string[]} arg - The key(s) to delete; either a single key or
   *                                an array of keys.
   */
  delete(arg) {
    const keys = Array.isArray(arg) ? arg : [arg];
    keys.forEach(key => delete this.entries[key]);
  }

  /**
   * Returns the difference (i.e. the relative complement) between the list and
   * the supplied set of keys.
   * @param {string[]} keys - The set of keys.
   * @returns {string[]} All keys that are present in the list but missing in the
   *                     supplied set of keys.
   */
  difference(keys) {
    return Object.keys(this.entries).filter(key => !keys.includes(key));
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
   * Checks if a given engine is already in the list.
   * @param {string} key - the unique engine identifier.
   * @returns true if engine is already in list, false otherwise.
   */
  has(key) {
    return Object.prototype.hasOwnProperty.call(this.entries, key);
  }
}

module.exports = EngineList;
