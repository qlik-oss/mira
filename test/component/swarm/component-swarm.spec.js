const chaiHttp = require('chai-http');
const nock = require('nock');
const specData = require('../../test-data/SwarmDockerClient.spec.data.json');
const sleep = require('../../test-utils/sleep');

const miraEndpoint = 'http://localhost:9100';
process.env.DOCKER_HOST = 'http://localhost:8001';

chai.use(chaiHttp);

describe('Mira in docker swarm mode', () => {
  let server;

  beforeEach(async () => {
    // Mock docker.sock
    nock('http://localhost:8001').filteringPath(() => '/tasks').get('/tasks').times(10)
      .reply(200, specData.endpointsResponse);
    nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
    nock(`http://${specData.miraOutput[1].engine.ip}:${specData.miraOutput[1].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
    nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.metricsPort}`).get('/metrics').times(10).reply(200, { metrics: 'some metrics' });
    nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.metricsPort}`).get('/metrics').times(10).reply(200, { metrics: 'some metrics' });
    server = require('../../../src/index'); // eslint-disable-line global-require
    await sleep(30);
  });

  describe('GET /engines', () => {
    it('should translate the docker swarm endpoints list to a mira engine list', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      expect(res).to.be.json;
      expect(res.body.length).to.equal(2);
    });

    it('should set the swarm property to holding the container info', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      expect(res.body[0].swarm).to.deep.equal(specData.endpointsResponse[0]);
      expect(res.body[1].swarm).to.deep.equal(specData.endpointsResponse[1]);
    });

    it('should set the health and metrics properties', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      expect(res.body[0].engine.health).to.deep.equal({ health: 'health is ok' });
      expect(res.body[0].engine.metrics).to.deep.equal({ metrics: 'some metrics' });
      expect(res.body[0].engine.status).to.equal('OK');
    });

    it('should return the local and swarm properties as undefined', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      expect(res.body[0].local).to.be.undefined;
      expect(res.body[0].kubernetes).to.be.undefined;
      expect(res.body[1].local).to.be.undefined;
      expect(res.body[1].kubernetes).to.be.undefined;
    });
  });

  describe('GET /health', () => {
    it('should return OK', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/health');
      expect(res.statusCode).to.equal(200);
    });
  });

  afterEach(() => {
    server.close();
    delete require.cache[require.resolve('../../../src/index')];
    nock.cleanAll();
  });
});
