const chaiHttp = require('chai-http');
const nock = require('nock');
const specData = require('../../test-data/LocalDockerClient.spec.data.json');

const miraEndpoint = 'http://localhost:9100';
process.env.DOCKER_HOST = 'http://localhost:8001';

chai.use(chaiHttp);

describe('Mira in local docker mode with two engines', () => {
  let server;

  before(() => {
    // Mock docker.sock
    nock('http://localhost:8001').get('/containers/json').times(10).reply(200, specData.endpointsResponse);
    // Engine healthcheck mocks
    nock(`http://${specData.miraOutput[0].engine.ip}:${specData.miraOutput[0].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
    nock(`http://${specData.miraOutput[1].engine.ip}:${specData.miraOutput[1].engine.port}`).get('/healthcheck').times(10).reply(200, { health: 'health is ok' });
    server = require('../../../src/index'); // eslint-disable-line global-require
  });

  it('GET /engine should return a list with two engines', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res).to.be.json;
    expect(res.body.length).to.equal(2);
  });

  it('the local property should be set and hold the container info', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].local).to.deep.equal(specData.endpointsResponse[1]);
    expect(res.body[1].local).to.deep.equal(specData.endpointsResponse[2]);
  });

  it('and swarm and kubernetes properties should not be set', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].swarm).to.be.undefined;
    expect(res.body[0].kubernetes).to.be.undefined;
    expect(res.body[1].swarm).to.be.undefined;
    expect(res.body[1].kubernetes).to.be.undefined;
  });

  after(() => {
    server.close();
    delete require.cache[require.resolve('../../../src/index')];
    delete require.cache[require.resolve('../../../src/Routes')];
    nock.cleanAll();
  });
});
