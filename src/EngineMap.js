const logger = require('./logger/Logger').get();

/**
 * Class providing a central repository for discovered QIX engine instances.
 */
class EngineMap {

  /**
   * Creates new {@link EngineMap}.
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
    engine.startStatusChecks();
    logger.debug(`Engine map key added: ${key}`);
  }

  /**
   * Deletes the given engine entries. Helth checks for the deleted entries
   * will be suspended.
   * @param {string[]} keys - The keys to delete.
   */
  delete(keys) {
    keys.forEach((key) => {
      if (this.has(key)) {
        const engine = this.entries[key];
        engine.stopStatusChecks();
        delete this.entries[key];
        logger.debug(`Engine map key removed: ${key}`);
      }
    });
  }

  /**
   * Deletes all engine entries. Helth checks for the deleted entries
   * will be suspended.
   */
  deleteAll() {
    logger.debug('Removing all engine entries from map');
    this.delete(Object.keys(this.entries));
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
   * Checks if a given engine is already in the list.
   * @param {string} key - the unique engine identifier.
   * @returns true if engine is already in list, false otherwise.
   */
  has(key) {
    return Object.prototype.hasOwnProperty.call(this.entries, key);
  }
}

module.exports = EngineMap;
