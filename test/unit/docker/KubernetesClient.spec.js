const nock = require('nock');
// const KubernetesClient = require('../../../src/docker/KubernetesClient');
const specData = require('./KubernetesClient.spec.data.json');

describe('KubernetesClient', () => {
  before(() => {
    nock('http://localhost:8001').get('/api/v1/endpoints').reply(200, specData.endpointsResponse);
  });

  // describe('#listEngines', () => {
  //   it('should translate the kubernetes endpoints list to a mira engine list', async () => {
  //     KubernetesClient.proxyPort = 8001;
  //     const rawEngines = engines.map(engine => ({
  //       properties: engine.properties,
  //       ipAddress: engine.ipAddress,
  //       port: engine.port,
  //     }));
  //     expect(rawEngines).to.deep.equal(specData.miraOutput);
  //   });
  // });
});
