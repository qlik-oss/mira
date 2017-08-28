const Config = require('../../src/Config');

describe('Config', () => {
  before(() => {
    Config.init();
  });

  describe('#miraPort', () => {
    afterEach(() => {
      delete process.env.PORT;
    });

    it('should have correct default value', () => {
      const expectedMiraPort = 9100;
      expect(Config.miraPort).to.equal(expectedMiraPort);
    });

    it('should have value as set by PORT env var', () => {
      const miraPort = 9111;
      process.env.PORT = miraPort.toString();
      Config.init();
      expect(Config.miraPort).to.equal(miraPort);
    });
  });

  describe('#enginePort', () => {
    afterEach(() => {
      delete process.env.QIX_ENGINE_PORT;
    });

    it('should have correct default value', () => {
      const expectedEnginePort = 9076;
      expect(Config.enginePort).to.equal(expectedEnginePort);
    });

    it('should have value as set by QIX_ENGINE_PORT env var', () => {
      const qixEnginePort = 9777;
      process.env.QIX_ENGINE_PORT = qixEnginePort.toString();
      Config.init();
      expect(Config.enginePort).to.equal(qixEnginePort);
    });
  });

  describe('#enginePortLabel', () => {
    afterEach(() => {
      delete process.env.QIX_ENGINE_API_PORT_LABEL;
    });

    it('should have correct default value', () => {
      const expectedEngineAPIPortLabel = 'qix-engine-port';
      expect(Config.engineAPIPortLabel).to.equal(expectedEngineAPIPortLabel);
    });

    it('should have value as set by QIX_ENGINE_API_PORT_LABEL env var', () => {
      const qixEngineAPIPortLabel = 'qix-engine-port-label-set-by-env';
      process.env.QIX_ENGINE_API_PORT_LABEL = qixEngineAPIPortLabel;
      Config.init();
      expect(Config.engineAPIPortLabel).to.equal(qixEngineAPIPortLabel);
    });
  });

  describe('#discoveryIds', () => {
    afterEach(() => {
      delete process.env.DISCOVERY_IDS;
    });

    it('should have correct default value', () => {
      expect(Config.discoveryIds).to.deep.equal(['qix-engine']);
    });

    it('should have value as set by DISCOVERY_IDS env var', () => {
      process.env.DISCOVERY_IDS = ' my-engine,   engine  , qlik-engine  ';
      Config.init();
      expect(Config.discoveryIds).to.deep.equal(['my-engine', 'engine', 'qlik-engine']);
    });
  });

  describe('#mode', () => {
    it('should return correct default value after initialization', () => {
      Config.init();
      expect(Config.mode).to.equal('swarm');
      Config.init({});
      expect(Config.mode).to.equal('swarm');
    });

    it('should return same value as provided in initialization', () => {
      Config.init({ mode: 'local' });
      expect(Config.mode).to.equal('local');
      Config.init({ mode: 'swarm' });
      expect(Config.mode).to.equal('swarm');
    });
  });
});
