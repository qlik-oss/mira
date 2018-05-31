const request = require('supertest');

describe('Mira when not using any orchestration client', () => {
  let app;
  before(async () => {
    app = require('../../../src/index'); // eslint-disable-line global-require
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
    const res = await request(app.listen()).get('/metrics').expect('Content-Type', 'text/plain; charset=utf-8');
    expect(res.statusCode).to.equal(200);
    expect(res.type).to.equal('text/plain');
    expect(res.text).to.be.a('string');
  });
});
