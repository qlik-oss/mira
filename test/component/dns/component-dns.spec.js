const request = require('supertest');

describe('Mira in dns mode with no engines', () => {
  let app;
  before(async () => {
    app = require('../../../src/index'); // eslint-disable-line global-require
  });

  it('GET /engines should return an empty engine list', async () => {
    const res = await request(app.listen()).get('/v1/engines');
    expect(res.body.length).to.equal(0);
  });
});
