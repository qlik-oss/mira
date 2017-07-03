const JSONUtils = require('../../../src/utils/JSONUtils');

describe('JSONUtils', () => {
  describe('#flatten()', () => {
    it('should flatten different types of values', () => {
      const toFlatten = {
        a: 123,
        b: 'foo',
        c: ['bar', 'foobar', 123],
        d: { k1: 111, k2: 222 },
      };
      const flattened = {};
      JSONUtils.flatten(toFlatten, flattened);
      expect(flattened).to.eql({
        a: 123,
        b: 'foo',
        c: ['bar', 'foobar', 123],
        'd.k1': 111,
        'd.k2': 222,
      });
    });

    it('should not flatten inside arrays', () => {
      const toFlatten = {
        a: [1, { aa: 'foo', bb: { k1: 111, k2: 222 } }],
      };
      const flattened = {};
      JSONUtils.flatten(toFlatten, flattened);
      expect(flattened.a[1]).to.eql({ aa: 'foo', bb: { k1: 111, k2: 222 } });
    });

    it('should not overwrite existing keys', () => {
      const toFlatten = {
        a: { b: 1, c: 2 },
        exists1: { s1: 'foo', s2: 'bar' },
        exists2: 123 };
      const flattened = {
        exists1: 'foobar',
        exists2: 'cubacola',
      };
      JSONUtils.flatten(toFlatten, flattened);
      expect(flattened).to.eql({
        'a.b': 1,
        'a.c': 2,
        exists1: 'foobar',
        exists2: 'cubacola',
      });
    });
  });
});
