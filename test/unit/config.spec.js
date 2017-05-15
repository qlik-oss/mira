const Config = require('../../src/Config');

describe('Config', () => {
  let config;
  beforeEach(() => {
  });
  after(() => {
    delete process.env.PORT;
  });

  describe('#constructor()', () => {
    it('should use PORT enivornment variable otherwise use default', () => {
      config = new Config();
      expect(config.port).to.equal(9100);
      process.env.PORT = 1234;
      config = new Config();
      expect(config.port).to.equal(1234);
    });
  });
});
