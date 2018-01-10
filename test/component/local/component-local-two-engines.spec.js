const nock = require('nock');
const specData = require('../../test-data/LocalDockerClient.spec.data.json');
const request = require('supertest');
const sleep = require('../../test-utils/sleep');

process.env.DOCKER_HOST = 'http://localhost:8001';
process.env.MIRA_ENGINE_DISCOVERY_INTERVAL = 1000;
process.env.MIRA_ENGINE_UPDATE_INTERVAL = 1000;

describe('Mira in local docker mode with two engines', () => {
  let app;

  before(async () => {
    // Mock docker.sock
    nock('http://localhost:8001').filteringPath(/\/containers\/json?.*/g, '/containers/json').get('/containers/json').times(10)
      .reply(200, specData.endpointsResponse);
    // Engine healthcheck mocks
    nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
    nock(`http://${specData.miraOutput[1].engine.ip}:${specData.miraOutput[1].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
    nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.metricsPort}`).get('/metrics').times(10).reply(200, { metrics: 'some metrics' });
    nock(`http://${specData.miraOutput[1].engine.ip}:${specData.miraOutput[1].engine.metricsPort}`).get('/metrics').times(10).reply(200, { metrics: 'some metrics' });
    app = require('../../../src/index'); // eslint-disable-line global-require
    await sleep(1000); // allow atleast 1 discovery
  });

  describe('GET /engines?format=condensed', () => {
    it('should return a list with two engines', async () => {
      const res = await request(app.listen()).get('/v1/engines').query({ format: 'condensed' });
      expect(res.body.length).to.equal(2);
    });

    it('should return engine status but not metrics nor orchestration info', async () => {
      const res = await request(app.listen()).get('/v1/engines').query({ format: 'condensed' });
      expect(res.body[0].engine.health).to.be.undefined;
      expect(res.body[0].engine.metrics).to.be.undefined;
      expect(res.body[0].local).to.be.undefined;
      expect(res.body[0].engine.status).to.equal('OK');
    });
  });

  describe('GET /engines', () => {
    it('should return a list with two engines', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body.length).to.equal(2);
    });

    it('should return the local property holding the container info', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body[0].local).to.deep.equal(specData.endpointsResponse[0]);
      expect(res.body[1].local).to.deep.equal(specData.endpointsResponse[1]);
    });

    it('should set the health and metrics properties', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body[0].engine.health).to.deep.equal({ health: 'health is ok' });
      expect(res.body[0].engine.metrics).to.deep.equal({ metrics: 'some metrics' });
      expect(res.body[0].engine.status).to.equal('OK');
    });

    it('should not set the swarm and kubernetes properties', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body[0].swarm).to.be.undefined;
      expect(res.body[0].kubernetes).to.be.undefined;
      expect(res.body[1].swarm).to.be.undefined;
      expect(res.body[1].kubernetes).to.be.undefined;
    });
  });

  after(() => nock.cleanAll());
});
