const myHttp = require('http');
const nock = require('nock');

const EngineHealthFetcher = require('../../src/EngineHealthFetcher');

describe('EngineHealthFetcher', () => {
  describe('#constructor()', () => {
    it('should initialize correctly when no argument passed', () => {
      const healthFetcher = new EngineHealthFetcher();
      expect(healthFetcher.http).to.not.be.undefined;
    });

    it('should initialize correctly passing own http instance', () => {
      const healthFetcher = new EngineHealthFetcher(myHttp);
      expect(healthFetcher.http).to.equal(myHttp);
    });
  });

  describe('#fetch()', () => {
    it('should resolve and receive health status properly on success', async () => {
      nock('http://10.0.0.1:7777').get('/healthz').reply(200, { healthy: true });
      const healthFetcher = new EngineHealthFetcher(myHttp);
      const health = await healthFetcher.fetch('10.0.0.1', 7777, '/healthz');
      expect(health.healthy).to.be.true;
    });

    it('should be rejected when health check returns error response', () => {
      nock('http://10.0.0.1:7777').get('/healthz').replyWithError('I am failing!');
      const healthFetcher = new EngineHealthFetcher(myHttp);
      const healthPromise = healthFetcher.fetch('10.0.0.1', 7777, '/healthz');
      expect(healthPromise).to.eventually.be.rejected;
    });

    it('should be rejected when response contains bad JSON', () => {
      nock('http://10.0.0.1:7777').get('/healthz').reply(200, '{ STRANGE % JSON /&&__ : &&& : }');
      const healthFetcher = new EngineHealthFetcher(myHttp);
      const healthPromise = healthFetcher.fetch('10.0.0.1', 7777, '/healthz');
      expect(healthPromise).to.eventually.be.rejected;
    });
  });
});
