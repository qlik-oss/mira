const Docker = require('dockerode');
const DockerClient = require('../../../src/docker/SwarmDockerClient');
const specData = require('./SwarmDockerClient.spec.data.json');

const docker = new Docker();

describe('SwarmDockerClient', () => {
  let listTasksStub;

  before(() => {
    listTasksStub = sinon.stub(docker, 'listTasks', (opts, callback) => callback(undefined, specData.endpointsResponse));
    // Provide stubbed Dockerode instance for testing purposes.
    DockerClient.docker = docker;
  });

  afterEach(() => {
    listTasksStub.reset();
  });

  describe('#listEngines', () => {
    it('should list two engines with matching image name', async () => {
      const engines = await DockerClient.listEngines('qlikea/engine');
      const rawEngines = engines.map(engine => ({
        properties: engine.properties,
        ipAddress: engine.ipAddress,
        port: engine.port,
      }));
      expect(listTasksStub).to.be.called.once;
      expect(listTasksStub).to.be.calledWith({ filters: '{ "desired-state": ["running"] }' });
      expect(rawEngines).to.deep.equal(specData.miraOutput);
    });

    it('should not list any engines since no container matches provided image name', async () => {
      const engines = await DockerClient.listEngines('xxxyyyzzz');
      expect(listTasksStub).to.be.called.once;
      expect(engines.length === 0).to.be.true;
    });
  });
});
