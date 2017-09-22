const Dredd = require('dredd');

const testHost = process.env.TEST_HOST || 'localhost';

const dreddConfiguration = {
  server: `http://${testHost}:9100`,
  options: {
    path: './doc/api-doc.yml',
    level: 'silly',
    color: true,
  },
};

describe('Validating the OpenAPI spec using Dredd', () => {
  it('should not throw any errors', (done) => {
    const dredd = new Dredd(dreddConfiguration);
    dredd.run((error, stats) => {
      expect(error).to.be.null;
      expect(stats.errors).to.equal(0);
      expect(stats.failures).to.equal(0);
      done();
    });
  });
});
