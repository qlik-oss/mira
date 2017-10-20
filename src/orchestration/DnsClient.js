const dns = require('dns');
const logger = require('../logger/Logger').get();
const Config = require('../Config');

/**
 * Class providing a dns client implementation that collects information on engines.
 */
class DnsClient {
  /**
   * Lists engines.
   * @param {string} hostname - Host name to perform dns lookup on.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines() {
    return new Promise((resolve, reject) => {
      dns.lookup(Config.discoveryHostname, {
        family: 4,
        all: true,
      }, (err, records) => {
        if (!err) {
          const engineInfoEntries = records.map((record) => {
            const engine = {
              ip: record.address,
            };
            const key = record.address.replace(/\./g, '');
            return {
              key,
              engine,
              dns: record,
              labels: [],
            };
          });
          resolve(engineInfoEntries);
        } else if (err.code && err.code === dns.NOTFOUND) {
          resolve([]);
        } else {
          logger.error('Error when listing dns records', err);
          reject(err);
        }
      });
    });
  }
}

module.exports = DnsClient;
