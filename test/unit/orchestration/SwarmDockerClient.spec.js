const Docker = require('dockerode');
const DockerClient = require('../../../src/orchestration/SwarmDockerClient');
const specData = require('./../../test-data/SwarmDockerClient.spec.data.json');
const specDataMultipleNetworks = require('./../../test-data/SwarmMultipleNetworks.spec.data.json');
const Config = require('../../../src/Config');

const docker = new Docker();

describe('SwarmDockerClient', () => {
  let listTasksStub;

  afterEach(() => {
    listTasksStub.restore();
  });

  describe('#listEngines', () => {
    it('should list two engines with matching discovery label', async () => {
      listTasksStub = sinon.stub(docker, 'listTasks').callsFake((opts, callback) => callback(undefined, specData.endpointsResponse));
      DockerClient.docker = docker;
      const engines = await DockerClient.listEngines();
      const rawEngines = engines.map(item => ({
        engine: item.engine,
      }));
      expect(listTasksStub).to.have.been.calledOnce;
      expect(rawEngines.length).to.equal(2);
    });

    it('should not list any engines since no container matches provided image name', async () => {
      listTasksStub = sinon.stub(docker, 'listTasks').callsFake((opts, callback) => callback(undefined, []));
      DockerClient.docker = docker;
      const engines = await DockerClient.listEngines();
      expect(listTasksStub).to.have.been.calledOnce;
      expect(engines.length === 0).to.be.true;
    });

    it('should set the the swarm property to hold the container info', async () => {
      listTasksStub = sinon.stub(docker, 'listTasks').callsFake((opts, callback) => callback(undefined, specData.endpointsResponse));
      const engines = await DockerClient.listEngines();
      expect(listTasksStub).to.have.been.calledOnce;
      expect(engines[0].swarm).to.deep.equal(specData.endpointsResponse[0]);
      expect(engines[1].swarm).to.deep.equal(specData.endpointsResponse[1]);
    });

    it('should not set the local and kubernetes properties', async () => {
      listTasksStub = sinon.stub(docker, 'listTasks').callsFake((opts, callback) => callback(undefined, specData.endpointsResponse));
      const engines = await DockerClient.listEngines();
      expect(listTasksStub).to.have.been.calledOnce;
      expect(engines[0].local).to.be.undefined;
      expect(engines[0].kubernetes).to.be.undefined;
      expect(engines[1].local).to.be.undefined;
      expect(engines[1].kubernetes).to.be.undefined;
    });

    it('should return multiple IP address for an engine running on multiple networks', async () => {
      process.env.MIRA_MODE = 'swarm';
      process.env.MIRA_SWARM_ENGINE_NETWORKS = 'engine_network';
      Config.init();
      listTasksStub = sinon.stub(docker, 'listTasks').callsFake((opts, callback) => callback(undefined, specDataMultipleNetworks));
      const engines = await DockerClient.listEngines();
      expect(listTasksStub).to.have.been.calledOnce;
      const networks = engines[0].engine.networks;
      expect(networks.length).to.equal(2);
      expect(networks).to.deep.include({
        name: 'mira-stack_default',
        ip: '10.0.1.9',
      });
      expect(networks).to.deep.include({
        name: 'engine_network',
        ip: '10.0.4.6',
      });
    });

    it('should not return any engines not belonging to any network', async () => {
      const specNoNetwork = specDataMultipleNetworks;
      specNoNetwork[0].NetworksAttachments = [];
      listTasksStub = sinon.stub(docker, 'listTasks').callsFake((opts, callback) => callback(undefined, specNoNetwork));
      const engines = await DockerClient.listEngines();
      expect(listTasksStub).to.have.been.calledOnce;
      expect(engines.length).to.equal(0);
    });
  });
});
