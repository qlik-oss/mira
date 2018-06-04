const request = require('supertest');

const testHost = process.env.TEST_HOST || 'localhost';
const miraEndpoint = `http://${testHost}:9100`;

describe('GET /engines?format=condensed', () => {
  it('should return two engines', async () => {
    const res = await request(miraEndpoint).get('/v1/engines').query({ format: 'condensed' });
    expect(res.body.length).to.equal(2);
  });
  it('should return engines running on the same port but with different IPs', async () => {
    const res = await request(miraEndpoint).get('/v1/engines').query({ format: 'condensed' });
    expect(res.body[0].engine.port).to.equal(9076);
    expect(res.body[1].engine.port).to.equal(9076);
    expect(res.body[0].engine.networks[0].ip).to.not.equal(res.body[1].engine.networks[0].ip);
  });
  it('should include a status for health and metrics of each engine', async () => {
    const res = await request(miraEndpoint).get('/v1/engines').query({ format: 'condensed' });
    expect(res.body[0].engine.status).to.equal('OK');
    expect(res.body[1].engine.status).to.equal('OK');
  });
});

describe('GET /engines', () => {
  it('should return two engines', async () => {
    const res = await request(miraEndpoint).get('/v1/engines');
    expect(res.body.length).to.equal(2);
  });
  it('should return engines running on the same port but with different IPs', async () => {
    const res = await request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].engine.port).to.equal(9076);
    expect(res.body[1].engine.port).to.equal(9076);
    expect(res.body[0].engine.networks[0].ip).to.not.equal(res.body[1].engine.networks[0].ip);
  });
  it('should include health with info about allocated memory and total cpu', async () => {
    const res = await request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].engine.health).to.include.keys('mem', 'cpu');
    expect(res.body[1].engine.health).to.include.keys('mem', 'cpu');
  });
  it('should include metrics for each engine', async () => {
    const res = await request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].engine.metrics).to.not.be.empty;
    expect(res.body[1].engine.metrics).to.not.be.empty;
  });
  it('should include a status for health and metrics of each engine', async () => {
    const res = await request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].engine.status).to.equal('OK');
    expect(res.body[1].engine.status).to.equal('OK');
  });
});

describe('GET /health', () => {
  it('should return OK', async () => {
    const res = await request(miraEndpoint).get('/health');
    expect(res.statusCode).to.equal(200);
  });
});

describe('GET /metrics', () => {
  it('should return Miras own metrics', async () => {
    const res = await request(miraEndpoint).get('/metrics');
    expect(res.statusCode).to.equal(200);
    expect(res.type).to.equal('text/plain');
    expect(res.text.length).to.not.equal(0);
    expect(res.text).to.contain('mira_build_info');
    expect(res.text).to.contain('http_request_duration_seconds');
  });
});

describe('GET /openapi', () => {
  it('should return OK and the swagger ui', async () => {
    const res = await request(miraEndpoint).get('/openapi');
    expect(res.statusCode).to.equal(200);
    expect(res.type).to.equal('text/html');
  });
});
