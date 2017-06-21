/* eslint-disable no-unused-expressions */
const EngineEntry = require('../../src/EngineEntry');

describe('EngineEntry', () => {
  before(() => {
  });

  describe('#constructor()', () => {
    it('Valid arguments', () => {
      // TODO: Write tests
      const entry = new EngineEntry({ a: 'foo', b: 'bar' }, '10.10.10.10', 9999);
      expect(entry);
    });
    it('Invalid arguments', () => {
      // TODO: Write tests
    });
  });
});
