/* eslint-disable no-unused-expressions */

const nock = require('nock');
const KubernetesClient = require('../../../src/docker/KubernetesClient');
const specData = require('./KubernetesClient.spec.data.json');

describe('KubernetesClient', () => {
  before(() => {
    nock('http://localhost:8001').get('/api/v1/endpoints').reply(200, specData.endpointsResponse);
  });

  describe('#listEngines', () => {
    it('should translate the kubernetes endpoints list to a mira engine list', async () => {
      const entries = await KubernetesClient.listEngines('engine');
      // eslint-disable-next-line
      const engines = entries.map((entry) => {
        return {
          properties: entry.properties,
          ipAddress: entry.ipAddress,
          port: entry.port
        };
      });
      expect(engines).to.deep.equal(specData.miraOutput);
    });
  });
});
