const mock = require('mock-require');

mock('../src/logger/Logger', {
  get() {
    return {
      info() {},
      error() {},
      on() {},
      debug() {},
      warn() {},
    };
  },
});
