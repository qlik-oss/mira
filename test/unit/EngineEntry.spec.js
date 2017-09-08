const EngineEntry = require('../../src/EngineEntry');
const EngineHealthFetcher = require('../../src/EngineHealthFetcher');
const sleep = require('../test-utils/sleep');

describe('EngineEntry', () => {
  let entry;
  let healthFetcher;
  let fetchStub;
  const healthOk = { status: 'ok' };

  describe('#constructor()', () => {
    beforeEach(() => {
      healthFetcher = new EngineHealthFetcher({ get: () => { } });
      fetchStub = sinon.stub(healthFetcher, 'fetch', async () => Promise.resolve(healthOk));
      entry = new EngineEntry({ engine: { ip: '10.10.10.10' }, labels: { 'qix-engine-api-port': '9998', 'qix-engine-metrics-port': '9999' } }, 10, healthFetcher);
    });

    it('should construct with arguments', () => {
      entry = new EngineEntry({ engine: { ip: '10.10.10.10' }, labels: { 'qix-engine-api-port': '9998', 'qix-engine-metrics-port': '9999' } }, 10, healthFetcher);
      expect(entry.properties).to.deep.equal({ engine: { ip: '10.10.10.10', port: 9998, metricsPort: 9999 }, labels: { 'qix-engine-api-port': '9998', 'qix-engine-metrics-port': '9999' } });
      expect(entry.refreshRate).to.equal(10);
    });

    it('should fallback to default api port if label is not set', () => {
      entry = new EngineEntry({ engine: { ip: '10.10.10.10' }, labels: { 'qix-engine-metrics-port': '9999' } }, 10, healthFetcher);
      expect(entry.properties).to.deep.equal({ engine: { ip: '10.10.10.10', port: 9076, metricsPort: 9999 }, labels: { 'qix-engine-metrics-port': '9999' } });
      expect(entry.refreshRate).to.equal(10);
    });

    it('should fallback to default metrics port if label is not set', () => {
      entry = new EngineEntry({ engine: { ip: '10.10.10.10' }, labels: { 'qix-engine-api-port': '9098' } }, 10, healthFetcher);
      expect(entry.properties).to.deep.equal({ engine: { ip: '10.10.10.10', port: 9098, metricsPort: 9090 }, labels: { 'qix-engine-api-port': '9098' } });
      expect(entry.refreshRate).to.equal(10);
    });
  });

  describe('#startHealthChecks()', () => {
    beforeEach(() => {
      healthFetcher = new EngineHealthFetcher({ get: () => { } });
      fetchStub = sinon.stub(healthFetcher, 'fetch', async () => Promise.resolve(healthOk));
      entry = new EngineEntry({ engine: { ip: '10.10.10.10' }, labels: { 'qix-engine-api-port': '9098', 'qix-engine-metrics-port': '9999' } }, 10, healthFetcher);
    });

    it('should fetch health periodically', async () => {
      entry.startHealthChecks();
      await sleep(30);  // Should make room for at least two time-outs.
      expect(fetchStub.callCount >= 2).to.be.true;
      expect(fetchStub).to.be.calledWith('10.10.10.10', 9098, '/healthcheck');
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
