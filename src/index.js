const Koa = require('koa');
const Router = require('koa-router');
const koaLoggerWinston = require('koa-logger-winston');
const commandLineArgs = require('command-line-args');
const swagger = require('swagger2');
const swagger2koa = require('swagger2-koa');
const path = require('path');
const logger = require('./logger/Logger').get();
const Config = require('./Config');
const EngineDiscovery = require('./EngineDiscovery');
const getDockerClient = require('./docker/getDockerClient');
const EngineHealthFetcher = require('./EngineHealthFetcher');

const apiVersion = 'v1';
const healthEndpoint = 'health';
const listEndpoint = 'list';
const queryEndpoint = 'query';

const commandLineOptions = commandLineArgs([{ name: 'mode', type: String }], { partial: true });
Config.init(commandLineOptions);

const app = new Koa();
const router = new Router({ prefix: `/${apiVersion}` });
const DockerClient = getDockerClient(Config.mode);
const engineDiscovery = new EngineDiscovery(DockerClient, EngineHealthFetcher);
const document = swagger.loadDocumentSync(path.join(__dirname, './../doc/api-doc.yml'));

function onUnhandledError(err) {
  logger.error('Process encountered an unhandled error', err);
  process.exit(1);
}

/*
 * Service bootstrapping
 */

router.get(`/${healthEndpoint}`, async (ctx) => { ctx.body = 'OK'; });

router.get(`/${listEndpoint}`, async (ctx) => {
  const result = await engineDiscovery.list();
  ctx.body = result;
});

router.get(`/${queryEndpoint}`, async (ctx) => {
  const requirements = JSON.parse(ctx.query.properties);
  const matches = await engineDiscovery.query(requirements);
  ctx.body = matches;
});

app
  .use(swagger2koa.ui(document, '/openapi'))
  .use(koaLoggerWinston(logger))
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(Config.port);

process.on('SIGTERM', () => {
  app.close(() => {
    logger.info('Process exiting on SIGTERM');
    process.exit(0);
  });
});

process.on('uncaughtException', onUnhandledError);
process.on('unhandledRejection', onUnhandledError);

logger.info(`Listening on port ${Config.port}`);
