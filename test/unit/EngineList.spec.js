const EngineList = require('../../src/EngineList');

const getEntry = () => ({ startHealthChecks: sinon.stub(), stopHealthChecks: sinon.stub() });

describe('EngineList', () => {
  let engineList;

  beforeEach(() => {
    engineList = new EngineList();
  });

  it('should add an entry', () => {
    const entry = getEntry();
    engineList.add('foo', entry);
    expect(engineList.entries.foo).to.deep.equal(entry);
  });

  it('should not allow undefined/null values', () => {
    expect(engineList.add.bind('foo')).to.throw();
    expect(engineList.add.bind('foo', null)).to.throw();
  });

  it('should not allow multiple entries to be added with the same key', () => {
    const entry = getEntry();
    engineList.add('foo', entry);
    expect(engineList.add.bind('foo', 'bar')).to.throw();
  });

  it('should delete multiple entries', () => {
    const entry1 = getEntry();
    const entry2 = getEntry();
    engineList.add('a', entry1);
    engineList.add('b', entry2);
    engineList.delete(['a', 'b']);
    expect(entry1.stopHealthChecks.calledOnce).to.equal(true);
    expect(entry2.stopHealthChecks.calledOnce).to.equal(true);
    expect(engineList.entries.a).to.equal(undefined);
    expect(engineList.entries.b).to.equal(undefined);
  });

  it('should handle empty deletes', () => {
    engineList.add('a', getEntry());
    engineList.add('b', getEntry());
    const entries = engineList.entries;
    engineList.delete([]);
    expect(entries).to.deep.equal(engineList.entries);
  });

  it('should calculate the difference', () => {
    expect(engineList.difference(['a', 'b', 'c '])).to.deep.equal([]);
    engineList.add('a', getEntry());
    engineList.add('b', getEntry());
    engineList.add('c', getEntry());
    expect(engineList.difference(['b', 'c', 'd'])).to.deep.equal(['a']);
    expect(engineList.difference(['d', 'e', 'f'])).to.deep.equal(['a', 'b', 'c']);
    expect(engineList.difference(['a', 'b', 'c'])).to.deep.equal([]);
  });

  it('should filter', () => {
    const entry1 = getEntry();
    const entry2 = getEntry();
    const entry3 = getEntry();
    entry1.satisfies = sinon.stub().returns(false);
    entry2.satisfies = sinon.stub().returns(false);
    entry3.satisfies = sinon.stub().returns(true);

    engineList.add('a', entry1);
    engineList.add('b', entry2);
    expect(engineList.filter('dummy')).to.deep.equal([]);

    engineList.add('c', entry3);
    expect(engineList.filter('dummy')).to.deep.equal([entry3]);
  });

  it('should exist', () => {
    engineList.add('foo', getEntry());
    expect(engineList.has('foo')).to.equal(true);
    expect(engineList.has('dummy')).to.equal(false);
  });

  it('should return all entries', () => {
    const entry1 = getEntry();
    const entry2 = getEntry();
    const entry3 = getEntry();
    engineList.add('a', entry1);
    engineList.add('b', entry2);
    engineList.add('c', entry3);
    expect(engineList.all()).to.deep.equal([entry1, entry2, entry3]);
  });
});
