/* eslint-disable no-unused-expressions,no-console,import/no-extraneous-dependencies,func-names */

const dockerSetup = require('./docker-setup');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');

const miraEndpoint = 'http://localhost:9100';
const debugMode = false;

if (debugMode) {
// eslint-disable-next-line global-require
  require('../../src/index');
} else {
  console.log('Expecting mira to be running inside docker');
}


chai.use(chaiHttp);
chai.use(chaiSubset);
describe('mira', () => {
  before(async function () {
    this.timeout(10000);
    await dockerSetup.removeService();
    await dockerSetup.awaitServiceDown();
  });

  after(async function () {
    this.timeout(10000);
    await dockerSetup.removeService();
  });

  describe('Listing when no engines are available', () => {
    it('should return an empty array', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      expect(res).to.be.json;
      expect(res.body.length).to.equal(0);
    });
  });

  describe('Start an engine and immediately try to list it', () => {
    before(async function () {
      this.timeout(10000);
      return dockerSetup.startService();
    });

    it('should return an empty array or an unhealthy engine', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      const result = JSON.parse(res.text);
      console.log(JSON.stringify(result, undefined, ' '));
      expect(res).to.be.json;
      expect(res.body.length === 0 || !res.body[0].properties.healthy).to.be.ok;
    });
  });

  describe('Await the engine to actually be started', () => {
    before(async function () {
      this.timeout(10000);
      return dockerSetup.awaitService();
    });

    it('should return the engine service task with properties from health etc', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      const result = JSON.parse(res.text);
      console.log(JSON.stringify(result, undefined, ' '));
      expect(res).to.be.json;
      expect(res.body.length).to.equal(1);
      expect(res.body[0].port).to.equal(9076);
      expect(res.body[0].properties).to.include.keys('mem.allocated', 'cpu.total');
    });
  });

  describe('Stop the engine again', () => {
    before(async function () {
      this.timeout(10000);
      await dockerSetup.removeService();
      return dockerSetup.awaitServiceDown();
    });

    it('should return an empty array', async () => {
      const res = await chai.request(miraEndpoint).get('/v1/engines');
      const result = JSON.parse(res.text);
      console.log(JSON.stringify(result, undefined, ' '));
      expect(res).to.be.json;
      expect(res.body.length).to.equal(0);
    });
  });
});

