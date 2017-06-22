/* eslint-disable no-unused-expressions */
const EngineEntry = require('../../src/EngineEntry');
const EngineHealthFetcher = require('../../src/EngineHealthFetcher');
const sleep = require('../../src/utils/sleep');

describe('EngineEntry', () => {
  before(() => {
  });

  describe('#constructor()', () => {
    it('should construct with arguments', () => {
      const entry = new EngineEntry({ a: 'foo', b: 'bar' }, '10.10.10.10', 9999);
      expect(entry.properties).to.deep.equal({ a: 'foo', b: 'bar' });
      expect(entry.ipAddress).to.equal('10.10.10.10');
      expect(entry.port).to.equal(9999);
    });
  });

  describe('#startHealthChecks', () => {
    it('should fetch health periodically', async () => {
      const entry = new EngineEntry({}, '10.10.10.10', 9999);
      const healthFetcher = new EngineHealthFetcher({ get: () => { } });
      const fetchStub = sinon.stub(healthFetcher, 'fetch');
      entry.startHealthChecks(healthFetcher, 10);
      await sleep(30);  // Should make room for at least two time-outs.
      expect(fetchStub.callCount >= 2).to.be.true;
      expect(fetchStub).to.be.calledWith('10.10.10.10', 9999, '/healthcheck');
      expect(entry.properties.healthy).to.be.true;
    });

    it('should be able to fetch at different intervals', async () => {
      const entry = new EngineEntry({}, '10.10.10.10', 9999);
      const healthFetcher = new EngineHealthFetcher({ get: () => { } });
      const fetchStub = sinon.stub(healthFetcher, 'fetch');
      const ms10 = 10;
      const ms100 = 100;

      entry.startHealthChecks(healthFetcher, ms10);
      await sleep(5 * ms10);
      entry.stopHealthChecks();
      const callCount1 = fetchStub.callCount;
      fetchStub.reset();

      entry.startHealthChecks(healthFetcher, ms100);
      await sleep(5 * ms100);
      entry.stopHealthChecks();
      const callCount2 = fetchStub.callCount;
      expect(Math.abs(callCount1 - callCount2) <= 1).to.be.true;
    });
  });
});
