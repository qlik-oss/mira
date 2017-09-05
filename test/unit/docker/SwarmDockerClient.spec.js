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
      const rawEngines = engines.map(item => ({
        engine: item.engine,
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

    it('the swarm property should be set and hold the container info', async () => {
      listTasksStub = sinon.stub(docker, 'listTasks', (opts, callback) => callback(undefined, specData.endpointsResponse));
      const engines = await DockerClient.listEngines('qix-engine');
      expect(listTasksStub).to.be.called.once;
      expect(engines[0].swarm).to.deep.equal(specData.endpointsResponse[0]);
      expect(engines[1].swarm).to.deep.equal(specData.endpointsResponse[1]);
    });

    it('and local and kubernetes properties should not be set', async () => {
      listTasksStub = sinon.stub(docker, 'listTasks', (opts, callback) => callback(undefined, specData.endpointsResponse));
      const engines = await DockerClient.listEngines('qix-engine');
      expect(listTasksStub).to.be.called.once;
      expect(engines[0].local).to.be.undefined;
      expect(engines[0].kubernetes).to.be.undefined;
      expect(engines[1].local).to.be.undefined;
      expect(engines[1].kubernetes).to.be.undefined;
    });
  });
});
