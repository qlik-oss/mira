// Swagger definition
module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'A Qlik Associative Engine discovery service',
    version: '1.0.0',
    description: 'REST API for discovering Qlik Associative Engines running in Docker containers.',
  },
  'x-qlik-visibility': 'public',
  'x-qlik-stability': 'experimental',
  servers: [{ url: 'http://localhost:9100' }],
};
