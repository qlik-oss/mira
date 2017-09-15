const myHttp = require('http');
const nock = require('nock');

const EngineStatusFetcher = require('../../src/EngineStatusFetcher');

describe('EngineStatusFetcher', () => {
  describe('#constructor()', () => {
    it('should initialize correctly when no argument passed', () => {
      const statusFetcher = new EngineStatusFetcher();
      expect(statusFetcher.http).to.not.be.undefined;
    });

    it('should initialize correctly passing own http instance', () => {
      const statusFetcher = new EngineStatusFetcher(myHttp);
      expect(statusFetcher.http).to.equal(myHttp);
    });
  });

  describe('#fetch()', () => {
    it('should resolve and receive health status properly on success', async () => {
      nock('http://10.0.0.1:7777').get('/healthz').reply(200, { healthy: true });
      const statusFetcher = new EngineStatusFetcher(myHttp);
      const health = await statusFetcher.fetch('10.0.0.1', 7777, '/healthz');
      expect(health.healthy).to.be.true;
    });

    it('should be rejected when health check returns error response', () => {
      nock('http://10.0.0.1:7777').get('/healthz').replyWithError('I am failing!');
      const statusFetcher = new EngineStatusFetcher(myHttp);
      const healthPromise = statusFetcher.fetch('10.0.0.1', 7777, '/healthz');
      expect(healthPromise).to.eventually.be.rejected;
    });

    it('should be rejected when response contains bad JSON', () => {
      nock('http://10.0.0.1:7777').get('/healthz').reply(200, '{ STRANGE % JSON /&&__ : &&& : }');
      const statusFetcher = new EngineStatusFetcher(myHttp);
      const healthPromise = statusFetcher.fetch('10.0.0.1', 7777, '/healthz');
      expect(healthPromise).to.eventually.be.rejected;
    });
  });
});
