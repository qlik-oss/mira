const hooks = require('hooks');

// Skip validation if transaction uses content-type text/plain - currently not supported in dredd
hooks.beforeEach((transaction) => {
  if (transaction.expected.headers['Content-Type'] === 'text/plain; charset=utf-8') {
    hooks.log('Transaction uses content type text/plain - skipping validation');
    transaction.skip = true; // eslint-disable-line
  }
});
