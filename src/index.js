const Koa = require('koa');
const Router = require('koa-router');
const koaLoggerWinston = require('koa-logger-winston');
const swagger2koa = require('swagger2-koa');
const swaggerJSDoc = require('swagger-jsdoc');
const logger = require('./logger/Logger').get();
const Config = require('./Config');
const EngineDiscovery = require('./EngineDiscovery');
const getDockerClient = require('./docker/getDockerClient');
const fs = require('fs-extra');

const apiVersion = 'v1';
const healthEndpoint = 'health';
const enginesEndpoint = 'engines';

Config.init();

const app = new Koa();
const router = new Router({ prefix: `/${apiVersion}` });
const DockerClient = getDockerClient(Config.mode);
const engineDiscovery = new EngineDiscovery(
  DockerClient,
  Config.engineDiscoveryRefreshRate,
  Config.engineHealthRefreshRate);

function onUnhandledError(err) {
  logger.error('Process encountered an unhandled error', err);
  process.exit(1);
}

// Swagger definition
const swaggerDefinition = {
  info: {
    title: 'A QIX Engine discovery service for Qlik Elastic',
    version: '0.0.1',
    description: 'REST API for discovering QIX Engines running in Docker containers. Different modes exist, local mode, swarm and kubernetes mode.',
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
  apis: ['./src/index.js'],
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

/**
  * @swagger
  * /health:
  *   get:
  *     description: Returns health status of the Mira service
  *     responses:
  *       200:
  *         description: OK
  */
router.get(`/${healthEndpoint}`, async (ctx) => { ctx.body = 'OK'; });

/**
  * @swagger
  * /engines:
  *   get:
  *     description:  Lists available QIX Engines.
  *     produces:
  *       - application/json
  *     responses:
  *       200:
  *         description: successful operation
  *         schema:
  *           type: array
  *           items:
  *             $ref: '#/definitions/containerInfo'
  */
router.get(`/${enginesEndpoint}`, async (ctx) => { ctx.body = await engineDiscovery.list(); });

app
  .use(swagger2koa.ui(swaggerSpec, '/openapi'))
  .use(koaLoggerWinston(logger))
  .use(router.routes())
  .use(router.allowedMethods());

const server = app.listen(Config.miraApiPort);

logger.info(`Listening on port ${Config.miraApiPort}`);

module.exports = server;

/**
 * @swagger
 * definitions:
 *   engineInfo:
 *     type: object
 *     properties:
 *       ip:
 *         description: IP address to use when connecting to the QIX Engine.
 *         type: string
 *       port:
 *         description: Port to use when communicating with the QIX Engine API.
 *         type: number
 *       metricsPort:
 *         description: Port to use when retrieving the QIX Engine metrics.
 *         type: number
 *       status:
 *         $ref: '#/definitions/containerStatus'
 *       health:
 *          description: Last health endpoint response of the QIX Engine.
 *          type: object
 *       metrics:
 *          description: Last metrics endpoint response of the QIX Engine.
 *   containerInfo:
 *     type: object
 *     required:
 *      - engine
 *     properties:
 *       engine:
 *         $ref: '#/definitions/engineInfo'
 *       local:
 *         type: object
 *         description: Entire container response if running in local docker mode.
 *       swarm:
 *         type: object
 *         description: Entire container response if running in docker swarm mode.
 *       kubernetes:
 *         type: object
 *         description: Entire container response if running in kubernetes mode.
 *   containerStatus:
 *     type: string
 *     description: Status of the QIX Engine.
 *     enum:
 *       - OK
 *       - UNHEALTHY
 *       - NO_METRICS
 */
