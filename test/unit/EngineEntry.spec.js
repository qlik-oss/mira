const EngineEntry = require('../../src/EngineEntry');
const EngineHealthFetcher = require('../../src/EngineHealthFetcher');
const sleep = require('../test-utils/sleep');

describe('EngineEntry', () => {
  let entry;
  let healthFetcher;
  let fetchStub;
  const healthOk = { status: 'ok' };

  beforeEach(() => {
    healthFetcher = new EngineHealthFetcher({ get: () => { } });
    fetchStub = sinon.stub(healthFetcher, 'fetch', async () => Promise.resolve(healthOk));
    entry = new EngineEntry({ engine: { health: {} } }, '10.10.10.10', 9999, 10, healthFetcher);
  });

  describe('#constructor()', () => {
    it('should construct with arguments', () => {
      expect(entry.properties).to.deep.equal({ engine: { health: {} } });
      expect(entry.ipAddress).to.equal('10.10.10.10');
      expect(entry.port).to.equal(9999);
      expect(entry.refreshRate).to.equal(10);
    });
  });

  describe('#startHealthChecks()', () => {
    it('should fetch health periodically', async () => {
      entry.startHealthChecks();
      await sleep(30);  // Should make room for at least two time-outs.
      expect(fetchStub.callCount >= 2).to.be.true;
      expect(fetchStub).to.be.calledWith('10.10.10.10', 9999, '/healthcheck');
      expect(entry.properties.engine.health.status).to.equal('ok');
    });

    it('should be possible to restart', async () => {
      entry.startHealthChecks();
      await sleep(30);
      const callCount = fetchStub.callCount;
      entry.startHealthChecks();
      await sleep(30);
      entry.stopHealthChecks();
      expect(fetchStub.callCount > callCount).to.be.true;
    });
  });

  describe('#stopHealthChecks()', () => {
    it('should stop fetching health', async () => {
      entry.startHealthChecks();
      await sleep(50);
      entry.stopHealthChecks();
      const countAfterStop1 = fetchStub.callCount;
      await sleep(50);
      const countAfterStop2 = fetchStub.callCount;
      expect(countAfterStop1).to.equal(countAfterStop2);
    });

    it('should be possible to call twice', async () => {
      entry.startHealthChecks();
      await sleep(50);
      entry.stopHealthChecks();
      entry.stopHealthChecks();
    });
  });
});
