/* eslint-disable no-unused-expressions */
const EngineEntry = require('../../src/EngineEntry');
const EngineHealthFetcher = require('../../src/EngineHealthFetcher');
const sleep = require('../test-utils/sleep');

describe('EngineEntry', () => {
  let entry;
  let healthFetcher;
  let fetchStub;

  beforeEach(() => {
    healthFetcher = new EngineHealthFetcher({ get: () => { } });
    fetchStub = sinon.stub(healthFetcher, 'fetch');
    entry = new EngineEntry({ a: 'foo', b: 'bar' }, '10.10.10.10', 9999, 10, healthFetcher);
  });

  describe('#constructor()', () => {
    it('should construct with arguments', () => {
      expect(entry.properties).to.deep.equal({ a: 'foo', b: 'bar' });
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
      expect(entry.properties.healthy).to.be.true;
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

  describe('#satisfies', () => {
    it('should handle non existing keys', () => {
      expect(entry.satisfies({ c: '> 150' })).to.be.false;
    });

    it('should handle arrays', () => {
      entry.properties.numb = 23;
      expect(entry.satisfies({ a: ['dummy', 'foo'] })).to.be.true;
      expect(entry.satisfies({ a: ['dummy', 'bar'] })).to.be.false;
      expect(entry.satisfies({ numb: [21, 22, 23] })).to.be.true;
      expect(entry.satisfies({ numb: ['21', '22', '23'] })).to.be.false;
    });

    it('should handle boolean types', () => {
      entry.properties.bool = false;
      expect(entry.satisfies({ bool: false })).to.be.true;
    });

    it('should handle a mix of boolean and string types', () => {
      entry.properties.bool1 = false;
      entry.properties.bool2 = 'false';
      entry.properties.bool3 = 'FaLsE';
      expect(entry.satisfies({ bool1: 'false' })).to.be.true;
      expect(entry.satisfies({ bool1: 'FaLsE' })).to.be.true;
      expect(entry.satisfies({ bool2: false })).to.be.true;
      expect(entry.satisfies({ bool3: false })).to.be.true;
    });

    it('should handle greater than', () => {
      entry.properties.numb = 30;
      expect(entry.satisfies({ numb: '>29' })).to.be.true;
      expect(entry.satisfies({ numb: '>30' })).to.be.false;
      expect(entry.satisfies({ numb: '>31' })).to.be.false;
    });

    it('should handle less than', () => {
      entry.properties.numb = 30;
      expect(entry.satisfies({ numb: '<29' })).to.be.false;
      expect(entry.satisfies({ numb: '<30' })).to.be.false;
      expect(entry.satisfies({ numb: '<31' })).to.be.true;
    });

    it('should handle equal values', () => {
      entry.properties.numb = 30;
      entry.properties.str = 'foobar';
      expect(entry.satisfies({ numb: 30 })).to.be.true;
      expect(entry.satisfies({ numb: 31 })).to.be.false;
      expect(entry.satisfies({ numb: '30' })).to.be.true;
      expect(entry.satisfies({ numb: '31' })).to.be.false;
      expect(entry.satisfies({ str: 'foobar' })).to.be.true;
      expect(entry.satisfies({ str: 'barfoo' })).to.be.false;
      expect(entry.satisfies({ str: 123 })).to.be.false;
    });
  });
});
