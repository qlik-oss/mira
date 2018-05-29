module.exports = {
  coverage: true,
  require: ['./test/mock.js'],
  glob: ['./test/unit/**/*.spec.js'],
  src: ['./src/**/*(!index).js'],
  nyc: {
    babel: false,
    exclude: ['**/coverage/**', '**/test/**'],
  },
  mocha: {
    bail: false,
  },
};
