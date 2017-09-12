const Koa = require('koa');
const koaLoggerWinston = require('koa-logger-winston');
const swagger2koa = require('swagger2-koa');
const swaggerJSDoc = require('swagger-jsdoc');
const logger = require('./logger/Logger').get();
const fs = require('fs-extra');
const Config = require('./Config');

Config.init();

const router = require('./Routes');

const app = new Koa();

function onUnhandledError(err) {
  logger.error('Process encountered an unhandled error', err);
  process.exit(1);
}

// Swagger definition
const swaggerDefinition = {
  info: {
    title: 'A QIX Engine discovery service for Qlik Elastic',
    version: '0.0.1',
    description: 'REST API for discovering QIX Engines running in Docker containers. Different modes exist, local, swarm and kubernetes mode.',
  },
  host: 'localhost:9100',
  schemes: ['http'],
  basePath: '/v1',
  'x-qlik-visibility': 'private',
  'x-qlik-stability': 'experimental',
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['./src/index.js', './src/Routes.js'],
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJSDoc(options);
fs.ensureDir('./doc').then(() => fs.writeJsonSync('./doc/api-doc.json', swaggerSpec));

/*
 * Service bootstrapping
 */

process.on('SIGTERM', () => {
  app.close(() => {
    logger.info('Process exiting on SIGTERM');
    process.exit(0);
  });
});

process.on('uncaughtException', onUnhandledError);
process.on('unhandledRejection', onUnhandledError);

app
  .use(swagger2koa.ui(swaggerSpec, '/openapi'))
  .use(koaLoggerWinston(logger))
  .use(router.routes())
  .use(router.allowedMethods());

const server = app.listen(Config.miraApiPort);

logger.info(`Listening on port ${Config.miraApiPort}`);

module.exports = server;

