// Swagger definition
module.exports = {
  info: {
    title: 'A Qlik Associative Engine discovery service',
    version: '0.2.0',
    description: 'REST API for discovering Qlik Associative Engines running in Docker containers.',
  },
  host: 'localhost:9100',
  schemes: ['http'],
  'x-qlik-visibility': 'public',
  'x-qlik-stability': 'experimental',
};
