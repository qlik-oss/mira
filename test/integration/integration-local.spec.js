const chaiHttp = require('chai-http');
const chaiSubset = require('chai-subset');

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
  it('and both engines should be running on the same port but with different IPs', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].port).to.equal(9076);
    expect(res.body[1].port).to.equal(9076);
    expect(res.body[0].ipAddress).to.not.equal(res.body[1].ipAddress);
  });
  it('and should include info about allocated memory and total cpu', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/engines');
    expect(res.body[0].properties).to.include.keys('mem.allocated', 'cpu.total');
    expect(res.body[1].properties).to.include.keys('mem.allocated', 'cpu.total');
  });
});

describe('GET /health', () => {
  it('should return OK', async () => {
    const res = await chai.request(miraEndpoint).get('/v1/health');
    expect(res.statusCode).to.equal(200);
  });
});
