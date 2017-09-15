const Docker = require('dockerode');
const DockerClient = require('../../../src/orchestration/LocalDockerClient');
const specData = require('./../../test-data/LocalDockerClient.spec.data.json');

const docker = new Docker();

describe('LocalDockerClient', () => {
  let listContainersStub;

  before(() => {
    listContainersStub = sinon.stub(docker, 'listContainers', callback => callback(undefined, specData.endpointsResponse));
    // Provide stubbed Dockerode instance for testing purposes.
    DockerClient.docker = docker;
  });

  afterEach(() => {
    listContainersStub.reset();
  });

  describe('#listEngines', () => {
    it('should list two engines with matching discovery label', async () => {
      const engines = await DockerClient.listEngines('qix-engine');
      const rawEngines = engines.map(engine => ({
        engine: engine.engine,
      }));
      expect(listContainersStub).to.be.called.once;
      expect(rawEngines.length).to.equal(2);
    });

    it('should not list any engines since discovery label does not match', async () => {
      const engines = await DockerClient.listEngines('xxxyyyzzz');
      expect(listContainersStub).to.be.called.once;
      expect(engines.length === 0).to.be.true;
    });

    it('the local property should be set and hold the container info', async () => {
      const engines = await DockerClient.listEngines('qix-engine');
      expect(listContainersStub).to.be.called.once;
      expect(engines[0].local).to.deep.equal(specData.endpointsResponse[1]);
      expect(engines[1].local).to.deep.equal(specData.endpointsResponse[2]);
    });

    it('and swarm and kubernetes properties should not be set', async () => {
      const engines = await DockerClient.listEngines('qix-engine');
      expect(listContainersStub).to.be.called.once;
      expect(engines[0].swarm).to.be.undefined;
      expect(engines[0].kubernetes).to.be.undefined;
      expect(engines[1].swarm).to.be.undefined;
      expect(engines[1].kubernetes).to.be.undefined;
    });
  });
});
