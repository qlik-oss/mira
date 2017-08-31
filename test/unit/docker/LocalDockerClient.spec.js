const Docker = require('dockerode');
const DockerClient = require('../../../src/docker/LocalDockerClient');
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
        properties: engine.properties,
        ipAddress: engine.ipAddress,
        port: engine.port,
      }));
      expect(listContainersStub).to.be.called.once;
      expect(rawEngines).to.deep.equal(specData.miraOutput);
    });

    it('should not list any engines since discovery label does not match', async () => {
      const engines = await DockerClient.listEngines('xxxyyyzzz');
      expect(listContainersStub).to.be.called.once;
      expect(engines.length === 0).to.be.true;
    });
  });
});
