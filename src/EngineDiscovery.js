const logger = require('./logger/Logger').get();
const Config = require('./Config');

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

class EngineDiscovery {

  constructor(DockerClient, EngineHealthFetcher) {
    this.DockerClient = DockerClient;
    this.EngineHealthFetcher = EngineHealthFetcher;
  }

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
