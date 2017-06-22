const EngineList = require('../../src/EngineList');

describe('EngineList', () => {
  let engineList;
  beforeEach(() => {
    engineList = new EngineList();
  });

  it('should add an entry', () => {
    engineList.add('foo', 'bar');
    expect(engineList.entries.foo).to.equal('bar');
  });

  it('should not allow undefined/null values', () => {
    expect(engineList.add.bind('foo')).to.throw();
    expect(engineList.add.bind('foo', null)).to.throw();
  });

  it('should not allow multiple entries to be added with the same key', () => {
    engineList.add('foo', 'bar');
    expect(engineList.add.bind('foo', 'ball')).to.throw();
  });

  it('should delete multiple entries', () => {
    const entry1 = { stopHealthChecks: sinon.stub() };
    const entry2 = { stopHealthChecks: sinon.stub() };
    engineList.add('a', entry1);
    engineList.add('b', entry2);
    engineList.delete(['a', 'b']);
    expect(entry1.stopHealthChecks.calledOnce).to.equal(true);
    expect(entry2.stopHealthChecks.calledOnce).to.equal(true);
    expect(engineList.entries.a).to.equal(undefined);
    expect(engineList.entries.b).to.equal(undefined);
  });

  it('should calculate the difference', () => {
    engineList.add('a', 1);
    engineList.add('b', 2);
    engineList.add('c', 3);
    expect(engineList.difference(['b', 'c', 'd'])).to.deep.equal(['a']);
    expect(engineList.difference(['d', 'e', 'f'])).to.deep.equal(['a', 'b', 'c']);
    expect(engineList.difference(['a', 'b', 'c'])).to.deep.equal([]);
  });

  it('should filter', () => {
    const entry1 = { satisfies: sinon.stub().returns(false) };
    const entry2 = { satisfies: sinon.stub().returns(false) };
    const entry3 = { satisfies: sinon.stub().returns(true) };

    engineList.add('a', entry1);
    engineList.add('b', entry2);
    expect(engineList.filter('dummy')).to.deep.equal([]);

    engineList.add('c', entry3);
    expect(engineList.filter('dummy')).to.deep.equal([entry3]);
  });

  it('should exist', () => {
    engineList.add('foo', 'bar');
    expect(engineList.has('foo')).to.equal(true);
    expect(engineList.has('dummy')).to.equal(false);
  });

  it('should return all entries', () => {
    engineList.add('a', 1);
    engineList.add('b', 2);
    engineList.add('c', 3);
    expect(engineList.all()).to.deep.equal([1, 2, 3]);
  });
});
