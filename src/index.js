const Koa = require('koa');
const Router = require('koa-router');
const koaLoggerWinston = require('koa-logger-winston');
const swagger = require('swagger2');
const swagger2koa = require('swagger2-koa');
const path = require('path');
const logger = require('./logger/Logger').get();
const Config = require('./Config');
const EngineDiscovery = require('./EngineDiscovery');
const getDockerClient = require('./docker/getDockerClient');

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
const document = swagger.loadDocumentSync(path.join(__dirname, './../doc/api-doc.yml'));

function onUnhandledError(err) {
  logger.error('Process encountered an unhandled error', err);
  process.exit(1);
}

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

router.get(`/${healthEndpoint}`, async (ctx) => { ctx.body = 'OK'; });

router.get(`/${enginesEndpoint}`, async (ctx) => {
  let properties;
  if (ctx.query.properties) {
    properties = JSON.parse(ctx.query.properties);
  }
  ctx.body = await engineDiscovery.list(properties);
});

app
  .use(swagger2koa.ui(document, '/openapi'))
  .use(koaLoggerWinston(logger))
  .use(router.routes())
  .use(router.allowedMethods());

const server = app.listen(Config.miraApiPort);

logger.info(`Listening on port ${Config.miraApiPort}`);

module.exports = server;
