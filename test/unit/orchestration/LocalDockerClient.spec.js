const Docker = require('dockerode');
const DockerClient = require('../../../src/orchestration/LocalDockerClient');
const specData = require('./../../test-data/LocalDockerClient.spec.data.json');

const docker = new Docker();

describe('LocalDockerClient', () => {
  let listContainersStub;

  describe('#listEngines', () => {
    afterEach(() => {
      listContainersStub.restore();
    });

    it('should list two engines with matching discovery label', async () => {
      listContainersStub = sinon.stub(docker, 'listContainers').callsFake((opts, callback) => callback(undefined, specData.endpointsResponse));
      DockerClient.docker = docker;
      const engines = await DockerClient.listEngines();
      const rawEngines = engines.map(engine => ({
        engine: engine.engine,
      }));
      expect(listContainersStub).to.have.been.calledOnce;
      expect(rawEngines.length).to.equal(2);
    });

    it('should not list any engines since discovery label does not match', async () => {
      listContainersStub = sinon.stub(docker, 'listContainers').callsFake((opts, callback) => callback(undefined, []));
      DockerClient.docker = docker;
      const engines = await DockerClient.listEngines();
      expect(listContainersStub).to.have.been.calledOnce;
      expect(engines.length === 0).to.be.true;
    });

    it('the local property should be set and hold the container info', async () => {
      listContainersStub = sinon.stub(docker, 'listContainers').callsFake((opts, callback) => callback(undefined, specData.endpointsResponse));
      DockerClient.docker = docker;
      const engines = await DockerClient.listEngines();
      expect(listContainersStub).to.have.been.calledOnce;
      expect(engines[0].local).to.deep.equal(specData.endpointsResponse[0]);
      expect(engines[1].local).to.deep.equal(specData.endpointsResponse[1]);
    });

    it('and swarm and kubernetes properties should not be set', async () => {
      listContainersStub = sinon.stub(docker, 'listContainers').callsFake((opts, callback) => callback(undefined, specData.endpointsResponse));
      DockerClient.docker = docker;
      const engines = await DockerClient.listEngines();
      expect(listContainersStub).to.have.been.calledOnce;
      expect(engines[0].swarm).to.be.undefined;
      expect(engines[0].kubernetes).to.be.undefined;
      expect(engines[1].swarm).to.be.undefined;
      expect(engines[1].kubernetes).to.be.undefined;
    });
  });
});
