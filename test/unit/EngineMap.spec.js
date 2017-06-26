const EngineMap = require('../../src/EngineMap');

const getEntry = () => ({ startHealthChecks: sinon.stub(), stopHealthChecks: sinon.stub() });

describe('EngineMap', () => {
  let engineMap;

  beforeEach(() => {
    engineMap = new EngineMap();
  });

  it('should add an entry', () => {
    const entry = getEntry();
    engineMap.add('foo', entry);
    expect(engineMap.entries.foo).to.deep.equal(entry);
  });

  it('should not allow undefined/null values', () => {
    expect(engineMap.add.bind('foo')).to.throw();
    expect(engineMap.add.bind('foo', null)).to.throw();
  });

  it('should not allow multiple entries to be added with the same key', () => {
    const entry = getEntry();
    engineMap.add('foo', entry);
    expect(engineMap.add.bind('foo', 'bar')).to.throw();
  });

  it('should delete multiple entries', () => {
    const entry1 = getEntry();
    const entry2 = getEntry();
    engineMap.add('a', entry1);
    engineMap.add('b', entry2);
    engineMap.delete(['a', 'b']);
    expect(entry1.stopHealthChecks.calledOnce).to.equal(true);
    expect(entry2.stopHealthChecks.calledOnce).to.equal(true);
    expect(engineMap.entries.a).to.equal(undefined);
    expect(engineMap.entries.b).to.equal(undefined);
  });

  it('should handle empty deletes', () => {
    engineMap.add('a', getEntry());
    engineMap.add('b', getEntry());
    const entries = engineMap.entries;
    engineMap.delete([]);
    expect(entries).to.deep.equal(engineMap.entries);
  });

  it('should calculate the difference', () => {
    expect(engineMap.difference(['a', 'b', 'c '])).to.deep.equal([]);
    engineMap.add('a', getEntry());
    engineMap.add('b', getEntry());
    engineMap.add('c', getEntry());
    expect(engineMap.difference(['b', 'c', 'd'])).to.deep.equal(['a']);
    expect(engineMap.difference(['d', 'e', 'f'])).to.deep.equal(['a', 'b', 'c']);
    expect(engineMap.difference(['a', 'b', 'c'])).to.deep.equal([]);
  });

  it('should filter', () => {
    const entry1 = getEntry();
    const entry2 = getEntry();
    const entry3 = getEntry();
    entry1.satisfies = sinon.stub().returns(false);
    entry2.satisfies = sinon.stub().returns(false);
    entry3.satisfies = sinon.stub().returns(true);

    engineMap.add('a', entry1);
    engineMap.add('b', entry2);
    expect(engineMap.filter('dummy')).to.deep.equal([]);

    engineMap.add('c', entry3);
    expect(engineMap.filter('dummy')).to.deep.equal([entry3]);
  });

  it('should exist', () => {
    engineMap.add('foo', getEntry());
    expect(engineMap.has('foo')).to.equal(true);
    expect(engineMap.has('dummy')).to.equal(false);
  });

  it('should return all entries', () => {
    const entry1 = getEntry();
    const entry2 = getEntry();
    const entry3 = getEntry();
    engineMap.add('a', entry1);
    engineMap.add('b', entry2);
    engineMap.add('c', entry3);
    expect(engineMap.all()).to.deep.equal([entry1, entry2, entry3]);
  });
});
