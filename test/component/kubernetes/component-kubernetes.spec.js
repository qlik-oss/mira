const chaiHttp = require('chai-http');
const nock = require('nock');
const specData = require('../../test-data/KubernetesClient.spec.data.json');

const miraEndpoint = 'http://localhost:9100';

chai.use(chaiHttp);

describe('Mira in kubernetes mode', () => {
  let server;

  beforeEach(() => {
    nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').times(10).reply(200, specData.endpointsResponse);
    server = require('../../../src/index'); // eslint-disable-line global-require
  });

  it('should translate the kubernetes endpoints list to a mira engine list', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res).to.be.json;
    expect(res.body.length).to.equal(2);
  });

  afterEach(() => {
    server.close();
    delete require.cache[require.resolve('../../../src/index')];
    nock.cleanAll();
  });
});
