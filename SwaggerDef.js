// Swagger definition
module.exports = {
  info: {
    title: 'A QIX Engine discovery service for Qlik Elastic',
    version: '0.1.2',
    description: 'REST API for discovering QIX Engines running in Docker containers. Different modes exist, local, swarm and kubernetes mode.',
  },
  host: 'localhost:9100',
  produces: ['application/json; charset=utf-8'],
  schemes: ['http'],
  basePath: '/v1',
  'x-qlik-visibility': 'private',
  'x-qlik-stability': 'experimental',
};
