const EngineDiscovery = require('../../src/EngineDiscovery');
const EngineEntry = require('../../src/EngineEntry');
const sleep = require('../test-utils/sleep');

describe('EngineDiscovery', () => {
  let FakeDockerClient;
  let listEnginesStub;
  let engineDiscovery;
  let startStatusChecks;

  before(() => {
    FakeDockerClient = { listEngines: () => [] };
    startStatusChecks = sinon.stub(EngineEntry.prototype, 'startStatusChecks');
  });

  afterEach(async () => {
    engineDiscovery.stop();
    listEnginesStub.restore();
  });

  after(() => {
    startStatusChecks.restore();
  });

  describe('#constructor()', () => {
    it('should construct and start periodical discovery scans', async () => {
      listEnginesStub = sinon.stub(FakeDockerClient, 'listEngines').resolves([]);
      engineDiscovery = new EngineDiscovery(FakeDockerClient, 20, 5000);
      await engineDiscovery.start();
      await sleep(50);
      expect(engineDiscovery).to.not.be.null;
      expect(engineDiscovery).to.not.be.undefined;
      expect(listEnginesStub.callCount >= 2).to.be.true;
    });
  });

  describe('#list({ format: "condensed" })', () => {
    const engine1 = {
      key: 'e1',
      engine: {
        networks: [{ name: 'default_network', ip: '10.0.0.1' }], port: 9077, metricsPort: 9999, status: 'OK',
      },
      statusIp: '10.0.0.1',
    };
    const engine2 = {
      key: 'e2',
      engine: {
        networks: [{ name: 'default_network', ip: '10.0.0.2' }], port: 9077, metricsPort: 9999, status: 'OK',
      },
      statusIp: '10.0.0.2',
    };
    const engine3 = {
      key: 'e3',
      engine: {
        networks: [{ name: 'default_network', ip: '10.0.0.3' }], port: 9077, metricsPort: 9999, status: 'OK',
      },
      statusIp: '10.0.0.3',
    };
    const engines1 = [engine1, engine2];
    const engines2 = [engine2, engine3];

    it('should list all discovered engines a compressed format', async () => {
      listEnginesStub = sinon.stub(FakeDockerClient, 'listEngines').resolves(engines1);
      engineDiscovery = new EngineDiscovery(FakeDockerClient, 20, 100000);
      await engineDiscovery.start();
      await sleep(50);
      let listedEngines = await engineDiscovery.list({ format: 'condensed' });

      expect(listedEngines.length).to.equal(2);
      let [first, second] = listedEngines;
      expect(first.engine).to.deep.equal(engine1.engine);
      expect(second.engine).to.deep.equal(engine2.engine);

      listEnginesStub.restore();
      listEnginesStub = sinon.stub(FakeDockerClient, 'listEngines').resolves(engines2);
      await sleep(50);
      listedEngines = await engineDiscovery.list({ format: 'condensed' });

      expect(listedEngines.length).to.equal(2);
      [first, second] = listedEngines;
      expect(first.engine).to.deep.equal(engine2.engine);
      expect(second.engine).to.deep.equal(engine3.engine);
    });
  });

  describe('#list()', () => {
    const engine1 = {
      key: 'e1',
      engine: {
        networks: [{ name: 'default_network', ip: '10.0.0.1' }], port: 9077, metricsPort: 9999, health: { status: 'Feeling good' }, metrics: { status: 'Performance is good' }, status: 'OK',
      },
      statusIp: '10.0.0.1',
    };
    const engine2 = {
      key: 'e2',
      engine: {
        networks: [{ name: 'default_network', ip: '10.0.0.2' }], port: 9077, metricsPort: 9999, health: { status: 'Feeling good' }, metrics: { status: 'Performance is good' }, status: 'OK',
      },
      statusIp: '10.0.0.2',
    };
    const engine3 = {
      key: 'e3',
      engine: {
        networks: [{ name: 'default_network', ip: '10.0.0.3' }], port: 9077, metricsPort: 9999, health: { status: 'Feeling good' }, metrics: { status: 'Performance is good' }, status: 'OK',
      },
      statusIp: '10.0.0.3',
    };
    const engines1 = [engine1, engine2];
    const engines2 = [engine2, engine3];

    it('should list all discovered engines in a verbose format', async () => {
      listEnginesStub = sinon.stub(FakeDockerClient, 'listEngines').resolves(engines1);
      engineDiscovery = new EngineDiscovery(FakeDockerClient, 20, 100000);
      await engineDiscovery.start();
      await sleep(50);
      let listedEngines = await engineDiscovery.list({});

      expect(listedEngines.length).to.equal(2);
      let [first, second] = listedEngines;
      expect(first.engine).to.deep.equal(engine1.engine);
      expect(second.engine).to.deep.equal(engine2.engine);

      listEnginesStub.restore();
      listEnginesStub = sinon.stub(FakeDockerClient, 'listEngines').resolves(engines2);
      await sleep(50);
      listedEngines = await engineDiscovery.list({});

      expect(listedEngines.length).to.equal(2);
      [first, second] = listedEngines;
      expect(first.engine).to.deep.equal(engine2.engine);
      expect(second.engine).to.deep.equal(engine3.engine);
    });

    it('should list all discovered engines if a previous but not last discovery was failed', async () => {
      listEnginesStub = sinon.stub(FakeDockerClient, 'listEngines')
        .onFirstCall()
        .resolves(engines1)
        .onSecondCall()
        .throws(new Error('Orchestration not responding'))
        .onThirdCall()
        .resolves(engines2);

      engineDiscovery = new EngineDiscovery(FakeDockerClient, 20, 100000);
      await engineDiscovery.start();
      await sleep(100);

      const listedEngines = await engineDiscovery.list({});

      expect(listedEngines.length).to.equal(2);
      const listedEngine1 = listedEngines[0];
      const listedEngine2 = listedEngines[1];
      expect(listedEngine1.engine).to.deep.equal(engine2.engine);
      expect(listedEngine2.engine).to.deep.equal(engine3.engine);
    });
  });
});
