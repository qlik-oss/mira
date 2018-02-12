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

  describe('#defaultEngineAPIPort', () => {
    it('should have correct default value', () => {
      const expectedEnginePort = 9076;
      expect(Config.defaultEngineAPIPort).to.equal(expectedEnginePort);
    });
  });

  describe('#engineAPIPortLabel', () => {
    afterEach(() => {
      delete process.env.MIRA_ENGINE_API_PORT_LABEL;
    });

    it('should have correct default value', () => {
      const expectedEngineAPIPortLabel = 'qix-engine-api-port';
      expect(Config.engineAPIPortLabel).to.equal(expectedEngineAPIPortLabel);
    });

    it('should have value as set by MIRA_ENGINE_API_PORT_LABEL env var', () => {
      const qixEngineAPIPortLabel = 'qix-engine-port-label-set-by-env';
      process.env.MIRA_ENGINE_API_PORT_LABEL = qixEngineAPIPortLabel;
      Config.init();
      expect(Config.engineAPIPortLabel).to.equal(qixEngineAPIPortLabel);
    });
  });

  describe('#defaultEngineMetricsPort', () => {
    it('should have correct default value', () => {
      const expectedEngineMetricsPort = 9090;
      expect(Config.defaultEngineMetricsPort).to.equal(expectedEngineMetricsPort);
    });
  });

  describe('#engineMetricsPortLabel', () => {
    afterEach(() => {
      delete process.env.MIRA_ENGINE_METRICS_PORT_LABEL;
    });

    it('should have correct default value', () => {
      const expectedEngineMetricsPortLabel = 'qix-engine-metrics-port';
      expect(Config.engineMetricsPortLabel).to.equal(expectedEngineMetricsPortLabel);
    });

    it('should have value as set by MIRA_ENGINE_METRICS_PORT_LABEL env var', () => {
      const qixEngineMetricsPortLabel = 'qix-engine-metrics-port-label-set-by-env';
      process.env.MIRA_ENGINE_METRICS_PORT_LABEL = qixEngineMetricsPortLabel;
      Config.init();
      expect(Config.engineMetricsPortLabel).to.equal(qixEngineMetricsPortLabel);
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
      delete process.env.MIRA_QIX_ENGINE_HOSTNAME;
      delete process.env.MIRA_SWARM_ENGINE_NETWORKS;
      Config.engineNetworks = undefined; // Since init is static we need to reset config value
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

    it('should require qix engine hostname if dns mode is set', () => {
      const miraMode = 'dns';
      process.env.MIRA_MODE = miraMode;
      expect(Config.init).to.throw('MIRA_DISCOVERY_HOSTNAME');
    });

    it('should set dns mode if qix engine hostname is set', () => {
      const miraMode = 'dns';
      const qixHostname = 'engine.domain.com';
      process.env.MIRA_MODE = miraMode;
      process.env.MIRA_DISCOVERY_HOSTNAME = qixHostname;
      Config.init();
      expect(Config.mode).to.equal(miraMode);
      expect(Config.discoveryHostname).to.equal(qixHostname);
    });

    it('should set engine networks if multiple networks were defined and using swarm mode', () => {
      process.env.MIRA_MODE = 'swarm';
      process.env.MIRA_SWARM_ENGINE_NETWORKS = 'default_network,engine_network';
      Config.init();
      expect(Config.engineNetworks).to.deep.equal(['default_network', 'engine_network']);
    });

    it('should set engine network if one network was defined and using swarm mode', () => {
      process.env.MIRA_MODE = 'swarm';
      process.env.MIRA_SWARM_ENGINE_NETWORKS = 'default_network';
      Config.init();
      expect(Config.engineNetworks).to.deep.equal(['default_network']);
    });

    it('should not set any engine network if no network was defined', () => {
      process.env.MIRA_MODE = 'swarm';
      Config.engineNetworks = undefined;
      Config.init();
      expect(Config.engineNetworks).to.equal(undefined);
    });

    it('should not set any engine network if not using swarm mode', () => {
      process.env.MIRA_MODE = 'none';
      process.env.MIRA_SWARM_ENGINE_NETWORKS = 'default_network,engine_network';
      Config.init();
      expect(Config.engineNetworks).to.equal(undefined);
    });
  });
});
