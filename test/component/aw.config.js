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
    timeout: 5000,
  },
  babel: {
    enable: false,
  },
  mocks: [
    ['**/node_modules/@kubernetes/client-node/dist/index.js', './test/test-utils/kubeMock.js'],
  ],
};
