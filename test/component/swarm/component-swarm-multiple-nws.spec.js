const request = require('supertest');
const nock = require('nock');
const specData = require('../../test-data/SwarmMultipleNetworks.spec.data.json');
const sleep = require('../../test-utils/sleep');

process.env.DOCKER_HOST = 'http://localhost:8001';
process.env.MIRA_ENGINE_DISCOVERY_INTERVAL = 1000;
process.env.MIRA_ENGINE_UPDATE_INTERVAL = 1000;
process.env.MIRA_SWARM_ENGINE_NETWORKS = 'engine_network';

describe.only('Mira in docker swarm mode with multiple networks', () => {
  let app;

  before(async () => {
    // Mock docker.sock
    nock('http://localhost:8001').filteringPath(() => '/tasks').get('/tasks').times(10)
      .reply(200, specData);
    nock('http://10.0.4.6:9076').get('/healthcheck').times(10).reply(200, {
      health: 'health is perfect',
    });
    nock('http://10.0.4.6:9090').get('/metrics').times(10).reply(200, {
      metrics: 'metrics are good',
    });
    app = require('../../../src/index'); // eslint-disable-line global-require
    await sleep(1000); // Sleep to make room for status checks to succeed
  });

  describe('GET /engines', () => {
    it('should return one engine with two networks but only request status on one IP address', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body.length).to.equal(1);
      expect(res.body[0].engine.health).to.deep.equal({ health: 'health is perfect' });
      expect(res.body[0].engine.metrics).to.deep.equal({ metrics: 'metrics are good' });
      expect(res.body[0].engine.networks).to.deep.equal([{ name: 'mira-stack_default', ip: '10.0.1.9' }, { name: 'engine_network', ip: '10.0.4.6' }]);
    });
  });

  after(() => nock.cleanAll());
});
