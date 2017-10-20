const Docker = require('dockerode');
const DockerClient = require('../../../src/orchestration/SwarmDockerClient');
const specData = require('./../../test-data/SwarmDockerClient.spec.data.json');

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
  });
});
