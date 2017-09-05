const chaiHttp = require('chai-http');
const nock = require('nock');
const specData = require('../../test-data/KubernetesClient.spec.data.json');

const miraEndpoint = 'http://localhost:9100';

chai.use(chaiHttp);

describe('Mira in kubernetes mode', () => {
  let server;

  beforeEach(() => {
    nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').times(10).reply(200, specData.endpointsResponse);
    // Engine healthcheck mocks
    nock(`http://${specData.miraOutput[0].ipAddress}:${specData.miraOutput[0].port}`).get('/healthcheck').times(10).reply(200, {});
    nock(`http://${specData.miraOutput[1].ipAddress}:${specData.miraOutput[1].port}`).get('/healthcheck').times(10).reply(200, {});
    server = require('../../../src/index'); // eslint-disable-line global-require
  });

  it('GET /engines should translate the kubernetes endpoints list to a mira engine list', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res).to.be.json;
    expect(res.body.length).to.equal(2);
  });

  it('GET /health should return OK', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/health');
    expect(res.statusCode).to.equal(200);
  });

  it('the kubernetes property should be set and hold the container info', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].kubernetes).to.deep.equal(specData.endpointsResponse.items[0]);
    expect(res.body[1].kubernetes).to.deep.equal(specData.endpointsResponse.items[1]);
  });

  it('and local and swarm properties should not be set', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].local).to.be.undefined;
    expect(res.body[0].swarm).to.be.undefined;
    expect(res.body[1].local).to.be.undefined;
    expect(res.body[1].swarm).to.be.undefined;
  });

  afterEach(() => {
    server.close();
    delete require.cache[require.resolve('../../../src/index')];
    nock.cleanAll();
  });
});
