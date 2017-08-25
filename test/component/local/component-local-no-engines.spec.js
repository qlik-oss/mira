const chaiHttp = require('chai-http');
const nock = require('nock');

const miraEndpoint = 'http://localhost:9100';
process.env.DOCKER_HOST = 'http://localhost:8001';

chai.use(chaiHttp);

describe('Mira in local docker mode with no engines', () => {
  let server;

  before(() => {
    nock('http://localhost:8001').get('/containers/json').times(10).reply(200, []);
    server = require('../../../src/index'); // eslint-disable-line global-require
  });

  it('should return an empty engine list', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res).to.be.json;
    expect(res.body.length).to.equal(0);
  });

  after(() => {
    server.close();
    delete require.cache[require.resolve('../../../src/index')];
    nock.cleanAll();
  });
});
