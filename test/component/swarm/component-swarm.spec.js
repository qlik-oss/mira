const chaiHttp = require('chai-http');
const nock = require('nock');
const specData = require('../../test-data/SwarmDockerClient.spec.data.json');

const miraEndpoint = 'http://localhost:9100';
process.env.DOCKER_HOST = 'http://localhost:8001';

chai.use(chaiHttp);

describe('Mira in docker swarm mode', () => {
  let server;

  before(() => {
    nock('http://localhost:8001').filteringPath(() => '/')
      .get('/').times(10)
      .reply(200, specData.endpointsResponse);
    server = require('../../../src/index'); // eslint-disable-line global-require
  });

  it('should translate the docker swarm endpoints list to a mira engine list', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res).to.be.json;
    expect(res.body.length).to.equal(3);
  });

  afterEach(() => {
    server.close();
    delete require.cache[require.resolve('../../../src/index')];
    nock.cleanAll();
  });
});
