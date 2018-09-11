module.exports = {
  coverage: true,
  require: ['./test/mock.js'],
  glob: ['./test/unit/**/*.spec.js'],
  src: ['./src/**/*(!index).js'],
  nyc: {
    babel: false,
    exclude: ['**/coverage/**', '**/test/**'],
  },
  babel: {
    enable: false,
  },
  mocha: {
    bail: false,
  },
  mocks: [
    ['**/node_modules/@kubernetes/client-node/dist/index.js', './test/test-utils/kubeMock.js'],
  ],
};
