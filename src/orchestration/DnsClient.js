const dns = require('dns');
const util = require('util');
const Config = require('../Config');

/**
 * Class providing a DNS client implementation that collects information on engines.
 */
class DnsClient {
  /**
   * Lists engines.
   * @returns {Promise<EngineContainerSpec[]>} A promise to a list of engine container specs.
   */
  static async listEngines() {
    const lookup = util.promisify(dns.lookup);

    let records;
    try {
      records = await lookup(Config.discoveryHostname, {
        family: 4,
        all: true,
      });
    } catch (error) {
      if (error.code && error.code === dns.NOTFOUND) {
        records = [];
      } else {
        throw error;
      }
    }

    const engineInfoEntries = records.map((record) => {
      const engine = {
        ip: record.address,
      };
      const key = record.address.replace(/\./g, '');
      return {
        key,
        engine,
      };
    });
    return engineInfoEntries;
  }
}

module.exports = DnsClient;
