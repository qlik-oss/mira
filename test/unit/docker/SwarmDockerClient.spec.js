const Docker = require('dockerode');
const DockerClient = require('../../../src/docker/SwarmDockerClient');
const specData = require('./../../test-data/SwarmDockerClient.spec.data.json');

const docker = new Docker();

describe('SwarmDockerClient', () => {
  let listTasksStub;

  afterEach(() => {
    listTasksStub.restore();
  });

  describe('#listEngines', () => {
    it('should list two engines with matching discovery label', async () => {
      listTasksStub = sinon.stub(docker, 'listTasks', (opts, callback) => callback(undefined, specData.endpointsResponse));
      DockerClient.docker = docker;
      const engines = await DockerClient.listEngines('qix-engine');
      const rawEngines = engines.map(engine => ({
        properties: engine.properties,
        ipAddress: engine.ipAddress,
        port: engine.port,
      }));
      expect(listTasksStub).to.be.called.once;
      expect(rawEngines).to.deep.equal(specData.miraOutput);
    });

    it('should not list any engines since no container matches provided image name', async () => {
      listTasksStub = sinon.stub(docker, 'listTasks', (opts, callback) => callback(undefined, []));
      DockerClient.docker = docker;
      const engines = await DockerClient.listEngines('xxxyyyzzz');
      expect(listTasksStub).to.be.called.once;
      expect(engines.length === 0).to.be.true;
    });
  });
});
