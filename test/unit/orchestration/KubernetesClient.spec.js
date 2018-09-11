const nock = require('nock');
const KubernetesClientClass = require('../../../src/orchestration/KubernetesClient');
const podSpecData = require('./../../test-data/KubernetesClient.spec.data.json');
const replicaSetSpecData = require('./../../test-data/Replicaset.spec.data.json');
const deploymentSpecData = require('./../../test-data/Deployment.spec.data.json');
const Config = require('../../../src/Config');

let KubernetesClient;

before(() => {
  Config.init();
  KubernetesClient = new KubernetesClientClass();
});


describe('KubernetesClient', () => {
  describe('#listEngines', async () => {
    it('should translate the kubernetes endpoints list to a mira engine list', async () => {
      nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').reply(200, podSpecData.endpointsResponse);
      const engines = await KubernetesClient.listEngines();
      const rawEngines = engines.map(pod => ({
        engine: pod.engine,
      }));
      expect(rawEngines.length).to.deep.equal(2);
    });

    it('should not list any engines if discovery label does not match', async () => {
      nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').reply(200, { items: [] });
      const engines = await KubernetesClient.listEngines();
      expect(engines.length === 0).to.be.true;
    });

    it('should set the kubernetes property to hold the container info', async () => {
      nock('http://localhost:8001').get('/apis/apps/v1/replicasets').reply(200, replicaSetSpecData.endpointsResponse);
      nock('http://localhost:8001').get('/apis/apps/v1/deployments').reply(200, deploymentSpecData.endpointsResponse);
      nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').reply(200, podSpecData.endpointsResponse);
      const engines = await KubernetesClient.listEngines();
      expect(engines[0].kubernetes.pod).to.deep.equal(podSpecData.endpointsResponse.items[0]);
      expect(engines[0].kubernetes.replicaSet).to.deep.equal(replicaSetSpecData.endpointsResponse.items[0]);
      expect(engines[0].kubernetes.deployment).to.deep.equal(deploymentSpecData.endpointsResponse.items[0]);
      expect(engines[1].kubernetes.pod).to.deep.equal(podSpecData.endpointsResponse.items[1]);
      expect(engines[1].kubernetes.replicaSet).to.deep.equal(replicaSetSpecData.endpointsResponse.items[0]);
      expect(engines[1].kubernetes.deployment).to.deep.equal(deploymentSpecData.endpointsResponse.items[0]);
    });

    it('should not set the replicaset or deployment kubernetes subproperty if the kubernetes API does not return any data on those endpoints', async () => {
      nock('http://localhost:8001').get('/apis/apps/v1/replicasets').reply(401);
      nock('http://localhost:8001').get('/apis/apps/v1/deployments').reply(401);
      nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').reply(200, podSpecData.endpointsResponse);
      const engines = await KubernetesClient.listEngines();
      expect(engines[0].kubernetes.pod).to.deep.equal(podSpecData.endpointsResponse.items[0]);
      expect(engines[0].kubernetes.replicaSet).to.be.undefined;
      expect(engines[0].kubernetes.deployment).to.be.undefined;
      expect(engines[1].kubernetes.pod).to.deep.equal(podSpecData.endpointsResponse.items[1]);
      expect(engines[1].kubernetes.replicaSet).to.be.undefined;
      expect(engines[1].kubernetes.deployment).to.be.undefined;
    });

    it('should not set the local and swarm properties', async () => {
      nock('http://localhost:8001').get('/api/v1/pods?labelSelector=qix-engine').reply(200, podSpecData.endpointsResponse);
      const engines = await KubernetesClient.listEngines();
      expect(engines[0].local).to.be.undefined;
      expect(engines[0].swarm).to.be.undefined;
      expect(engines[1].local).to.be.undefined;
      expect(engines[1].swarm).to.be.undefined;
    });
  });
});
