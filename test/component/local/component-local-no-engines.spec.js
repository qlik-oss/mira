const nock = require('nock');
const request = require('supertest');
const sleep = require('../../test-utils/sleep');

process.env.DOCKER_HOST = 'http://localhost:8001';

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
    const res = await request(app.listen()).get('/v1/health');
    expect(res.statusCode).to.equal(200);
  });

  after(() => nock.cleanAll());
});
