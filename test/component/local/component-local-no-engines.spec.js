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

  it('GET /engines should return an empty engine list', (done) => {
    request(app.listen()).get('/v1/engines').expect([]).end(done);
  });

  it('GET /health should return OK', (done) => {
    request(app.listen()).get('/v1/health').expect(200).end(done);
  });

  after(() => nock.cleanAll());
});
