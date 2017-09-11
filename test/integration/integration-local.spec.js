const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');
//const sleep = require('../test-utils/sleep');

const testHost = process.env.TEST_HOST || 'localhost';
const miraEndpoint = `http://${testHost}:9100`;

chai.use(chaiHttp);
chai.use(chaiSubset);

describe('GET /engines', () => {
  it('should return two engines', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res).to.be.json;
    expect(res.body.length).to.equal(2);
  });
  it('should return engines running on the same port but with different IPs', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].engine.port).to.equal(9076);
    expect(res.body[1].engine.port).to.equal(9076);
    expect(res.body[0].engine.ip).to.not.equal(res.body[1].engine.ip);
  });
  it('should include health with info about allocated memory and total cpu', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].engine.health).to.include.keys('mem', 'cpu');
    expect(res.body[1].engine.health).to.include.keys('mem', 'cpu');
  });
  it('should include metrics', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    console.log(JSON.stringify(res.body));
    expect(res.body[0].engine.metrics).to.include.keys('mem', 'cpu');
    expect(res.body[1].engine.health).to.include.keys('mem', 'cpu');
  });
});

describe('GET /health', () => {
  it('should return OK', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/health');
    expect(res.statusCode).to.equal(200);
  });
});

describe('GET /openapi', () => {
  it('should return OK and the swagger ui', async () => {
    const res = await chai.request(miraEndpoint).get('/openapi');
    expect(res.statusCode).to.equal(200);
    expect(res.type).to.equal('text/html');
  });
});
