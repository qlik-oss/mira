const nock = require('nock');
const specData = require('../../test-data/KubernetesClient.spec.data.json');
const sleep = require('../../test-utils/sleep');
const request = require('supertest');

process.env.MIRA_ENGINE_DISCOVERY_INTERVAL = 1000;
process.env.MIRA_ENGINE_UPDATE_INTERVAL = 1000;

describe('Mira in kubernetes mode', () => {
  let app;

  before(async () => {
    nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').times(10).reply(200, specData.endpointsResponse);
    // Engine healthcheck mocks
    nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
    nock(`http://${specData.miraOutput[1].engine.ip}:${specData.miraOutput[1].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
    nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.metricsPort}`).get('/metrics').times(10).reply(200, { metrics: 'some metrics' });
    nock(`http://${specData.miraOutput[1].engine.ip}:${specData.miraOutput[1].engine.metricsPort}`).get('/metrics').times(10).reply(200, { metrics: 'some metrics' });
    app = require('../../../src/index'); // eslint-disable-line global-require
    await sleep(1000); // Sleep to make room for status checks to succeed
  });

  describe('GET /engines', () => {
    it('should translate the kubernetes endpoints list to a mira engine list', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body.length).to.equal(2);
    });

    it('should set the kubernetes property to holding the container info', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body[0].kubernetes).to.deep.equal(specData.endpointsResponse.items[0]);
      expect(res.body[1].kubernetes).to.deep.equal(specData.endpointsResponse.items[1]);
    });

    it('should set the health and metrics properties', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body[0].engine.health).to.deep.equal({ health: 'health is ok' });
      expect(res.body[0].engine.metrics).to.deep.equal({ metrics: 'some metrics' });
      expect(res.body[0].engine.status).to.equal('OK');
    });

    it('should return all the container labels', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body[0].engine.labels.service).to.equal('engine');
      expect(res.body[0].engine.labels['qix-engine']).to.equal('qix-engine');
      expect(res.body[0].engine.labels['qix-engine-api-port']).to.equal('9076');
      expect(res.body[0].engine.labels['qix-engine-metrics-port']).to.equal('9090');
    });

    it('should return the local and swarm properties as undefined', async () => {
      const res = await request(app.listen()).get('/v1/engines');
      expect(res.body[0].local).to.be.undefined;
      expect(res.body[0].swarm).to.be.undefined;
      expect(res.body[1].local).to.be.undefined;
      expect(res.body[1].swarm).to.be.undefined;
    });
  });

  describe('GET /health', () => {
    it('should return OK', async () => {
      const res = await request(app.listen()).get('/v1/health');
      expect(res.statusCode).to.equal(200);
    });
  });

  after(() => nock.cleanAll());
});
