/* eslint-disable no-unused-expressions */
const Config = require('../../src/Config');
const chai = require('chai');

describe('Config', () => {
  before(() => {
    Config.init();
  });

  describe('#miraPort', () => {
    it('should have correct value', () => {
      const expectedMiraPort = 9100;
      chai.expect(Config.miraPort).to.equal(expectedMiraPort);
    });
  });

  describe('#enginePort', () => {
    it('should have correct value', () => {
      const expectedEnginePort = 9076;
      chai.expect(Config.enginePort).to.equal(expectedEnginePort);
    });
  });

  describe('#engineImageName', () => {
    it('should have correct value', () => {
      const expectedEngineImageName = 'qlikea/engine';
      chai.expect(Config.engineImageName).to.equal(expectedEngineImageName);
    });
  });

  describe('#mode', () => {
    it('should return correct default value after initialization', () => {
      Config.init();
      chai.expect(Config.mode).to.equal('swarm');
      Config.init({});
      chai.expect(Config.mode).to.equal('swarm');
    });
    it('should return same value as provided in initialization', () => {
      Config.init({ mode: 'local' });
      chai.expect(Config.mode).to.equal('local');
      Config.init({ mode: 'swarm' });
      chai.expect(Config.mode).to.equal('swarm');
    });
  });
});
