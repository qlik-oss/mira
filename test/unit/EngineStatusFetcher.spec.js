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
    it('should resolve and receive health status properly on success - JSON', async () => {
      nock('http://10.0.0.1:7777').get('/healthz').reply(200, { healthy: true });
      const statusFetcher = new EngineStatusFetcher(myHttp);
      const health = await statusFetcher.fetch('10.0.0.1', 7777, '/healthz');
      expect(health.healthy).to.be.true;
    });

    it('should resolve and receive health status properly on success- PROM', async () => {
      const promText = `# HELP qix_build_info Engine version info
      # TYPE qix_build_info counter
      qix_build_info{revision="12.612.0"} 1.000000
      qix_build_info{version="12.612.0.0"} 1.000000
      qix_build_info{os="linux"} 1.000000`;
      const promJSON = [
        {
          name: 'qix_build_info',
          help: 'Engine version info',
          type: 'COUNTER',
          metrics: [
            {
              value: '1.000000',
              labels: {
                revision: '12.612.0',
              },
            },
            {
              value: '1.000000',
              labels: {
                version: '12.612.0.0',
              },
            },
          ],
        },
      ];
      nock('http://10.0.0.1:7777').get('/metrics').reply(200, promText);
      const statusFetcher = new EngineStatusFetcher(myHttp);
      const metrics = await statusFetcher.fetch('10.0.0.1', 7777, '/metrics');
      console.log(JSON.stringify(metrics));
      expect(metrics).to.deep.equal(promJSON);
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
