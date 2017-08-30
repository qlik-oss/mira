const Config = require('../../src/Config');

describe('Config', () => {
  before(() => {
    Config.init();
  });

  describe('#miraApiPort', () => {
    afterEach(() => {
      delete process.env.MIRA_API_PORT;
    });

    it('should have correct default value', () => {
      const expectedMiraApiPort = 9100;
      expect(Config.miraApiPort).to.equal(expectedMiraApiPort);
    });

    it('should have value as set by PORT env var', () => {
      const miraApiPort = 9111;
      process.env.MIRA_API_PORT = miraApiPort.toString();
      Config.init();
      expect(Config.miraApiPort).to.equal(miraApiPort);
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

  describe('#discoveryLabel', () => {
    afterEach(() => {
      delete process.env.MIRA_DISCOVERY_LABEL;
    });

    it('should have correct default value', () => {
      expect(Config.discoveryLabel).to.equal('qix-engine');
    });

    it('should have value as set by MIRA_DISCOVERY_LABEL env var', () => {
      process.env.MIRA_DISCOVERY_LABEL = '  qlik-engine     ';
      Config.init();
      expect(Config.discoveryLabel).to.equal('qlik-engine');
    });
  });

  describe('#mode', () => {
    afterEach(() => {
      delete process.env.MIRA_MODE;
    });

    it('should return correct default value after initialization', () => {
      Config.init();
      expect(Config.mode).to.equal('swarm');
      Config.init({});
      expect(Config.mode).to.equal('swarm');
    });

    it('should be able to set by MIRA_MODE env var', () => {
      const miraMode = 'kubernetes';
      process.env.MIRA_MODE = miraMode;
      Config.init();
      expect(Config.mode).to.equal(miraMode);
    });

  });
});
