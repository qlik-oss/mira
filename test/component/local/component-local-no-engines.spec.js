const nock = require('nock');
const request = require('supertest');
const sleep = require('../../test-utils/sleep');

process.env.DOCKER_HOST = 'http://localhost:8001';
process.env.MIRA_ENGINE_DISCOVERY_INTERVAL = 1000;
process.env.MIRA_ENGINE_UPDATE_INTERVAL = 1000;

describe('Mira in local docker mode with no engines', () => {
  let app;
  before(async () => {
    nock('http://localhost:8001').filteringPath(/\/containers\/json?.*/g, '/containers/json').get('/containers/json').times(10)
      .reply(200, []);
    app = require('../../../src/index'); // eslint-disable-line global-require
    await sleep(1000);
  });

  it('GET /engines should return an empty engine list', async () => {
    const res = await request(app.listen()).get('/v1/engines');
    expect(res.body.length).to.equal(0);
  });

  it('GET /health should return OK', async () => {
    const res = await request(app.listen()).get('/health');
    expect(res.statusCode).to.equal(200);
  });

  it('GET /metrics should return metrics in a string if accept header is not set', async () => {
    const res = await request(app.listen()).get('/v1/metrics').expect('Content-Type', 'text/plain; charset=utf-8');
    expect(res.statusCode).to.equal(200);
    expect(res.type).to.equal('text/plain');
    expect(res.text).to.be.a('string');
  });

  it('GET /metrics should return metrics in json format if accept header is set to json', async () => {
    const res = await request(app.listen()).get('/v1/metrics').set('Accept', 'application/json').expect('Content-Type', 'application/json; charset=utf-8');
    expect(res.statusCode).to.equal(200);
    expect(res.type).to.equal('application/json');
    expect(res.body).not.to.be.empty;
  });

  it('GET /metrics should return metrics in a string if accept header is set to text', async () => {
    const res = await request(app.listen()).get('/v1/metrics').set('Accept', 'text/plain').expect('Content-Type', 'text/plain; charset=utf-8');
    expect(res.statusCode).to.equal(200);
    expect(res.type).to.equal('text/plain');
    expect(res.text).to.be.a('string');
  });

  after(() => nock.cleanAll());
});
