module.exports = {
  // coverage: true,
  require: ['./test/mock.js'],
  glob: ['./test/component/**/*.spec.js'],
  src: ['./src/**/*(!index).js'],
  nyc: {
    babel: false,
  },
  mocha: {
    bail: false,
  },
};
