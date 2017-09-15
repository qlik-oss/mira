const nock = require('nock');
const KubernetesClient = require('../../../src/orchestration/KubernetesClient');
const specData = require('./../../test-data/KubernetesClient.spec.data.json');

describe('KubernetesClient', () => {
  describe('#listEngines', async () => {
    it('should translate the kubernetes endpoints list to a mira engine list', async () => {
      nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').reply(200, specData.endpointsResponse);
      const engines = await KubernetesClient.listEngines('qix-engine');
      const rawEngines = engines.map(pod => ({
        engine: pod.engine,
      }));
      expect(rawEngines.length).to.deep.equal(2);
    });

    it('should not list any engines if discovery label does not match', async () => {
      nock('http://localhost:8001').get('/api/v1/pods?labelSelector=xxxyyyzzz').reply(200, { items: [] });
      const engines = await KubernetesClient.listEngines('xxxyyyzzz');
      expect(engines.length === 0).to.be.true;
    });

    it('should set the kubernetes property to hold the container info', async () => {
      nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').reply(200, specData.endpointsResponse);
      const engines = await KubernetesClient.listEngines('qix-engine');
      expect(engines[0].kubernetes).to.deep.equal(specData.endpointsResponse.items[0]);
      expect(engines[1].kubernetes).to.deep.equal(specData.endpointsResponse.items[1]);
    });

    it('should not set the local and swarm properties', async () => {
      nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').reply(200, specData.endpointsResponse);
      const engines = await KubernetesClient.listEngines('qix-engine');
      expect(engines[0].local).to.be.undefined;
      expect(engines[0].swarm).to.be.undefined;
      expect(engines[1].local).to.be.undefined;
      expect(engines[1].swarm).to.be.undefined;
    });
  });
});
