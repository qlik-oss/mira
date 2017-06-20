/* eslint-disable no-unused-expressions */
const EngineEntry = require('../../src/EngineEntry');

describe('EngineEntry', () => {
  before(() => {
  });

  describe('#constructor()', () => {

    it('should have correct default value', () => {
      
    });
  });

  describe('#enginePort', () => {
    afterEach(() => {
      // delete process.env.QIX_ENGINE_PORT;
    });

    it('should have correct default value', () => {
      // const expectedEnginePort = 9076;
      // expect(Config.enginePort).to.equal(expectedEnginePort);
    });

    it('should have value as set by QIX_ENGINE_PORT env var', () => {
      // const qixEnginePort = 9777;
      // process.env.QIX_ENGINE_PORT = qixEnginePort.toString();
      // Config.init();
      // expect(Config.enginePort).to.equal(qixEnginePort);
    });
  });
});
