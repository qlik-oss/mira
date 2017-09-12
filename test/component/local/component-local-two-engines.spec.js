const chaiHttp = require('chai-http');
const nock = require('nock');
const specData = require('../../test-data/LocalDockerClient.spec.data.json');
const sleep = require('../../test-utils/sleep');

const miraEndpoint = 'http://localhost:9100';
process.env.DOCKER_HOST = 'http://localhost:8001';

chai.use(chaiHttp);

describe('Mira in local docker mode with two engines', () => {
  let server;

  describe('GET /engines', () => {
    beforeEach(async () => {
      // Mock docker.sock
      nock('http://localhost:8001').get('/containers/json').times(10).reply(200, specData.endpointsResponse);
      // Engine healthcheck mocks
      nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
      nock(`http://${specData.miraOutput[1].engine.ip}:${specData.miraOutput[1].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
      nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.metricsPort}`).get('/metrics').times(10).reply(200, { metrics: 'some metrics' });
      nock(`http://${specData.miraOutput[1].engine.ip}:${specData.miraOutput[1].engine.metricsPort}`).get('/metrics').times(10).reply(200, { metrics: 'some metrics' });
      server = require('../../../src/index'); // eslint-disable-line global-require
      await sleep(30); // Sleep to make room for status checks to succeed
    });

    it('should return a list with two engines', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      expect(res).to.be.json;
      expect(res.body.length).to.equal(2);
    });

    it('should return the local property holding the container info', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      expect(res.body[0].local).to.deep.equal(specData.endpointsResponse[1]);
      expect(res.body[1].local).to.deep.equal(specData.endpointsResponse[2]);
    });

    it('should set the health and metrics properties', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      expect(res.body[0].engine.health).to.deep.equal({ health: 'health is ok' });
      expect(res.body[0].engine.metrics).to.deep.equal({ metrics: 'some metrics' });
      expect(res.body[0].engine.status).to.equal('OK');
    });

    it('should not set the swarm and kubernetes properties', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      expect(res.body[0].swarm).to.be.undefined;
      expect(res.body[0].kubernetes).to.be.undefined;
      expect(res.body[1].swarm).to.be.undefined;
      expect(res.body[1].kubernetes).to.be.undefined;
    });

    afterEach(() => {
      server.close();
      delete require.cache[require.resolve('../../../src/index')];
      nock.cleanAll();
    });
  });
});
