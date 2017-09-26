const Koa = require('koa');
const koaLoggerWinston = require('koa-logger-winston');
const swagger = require('swagger2');
const swagger2koa = require('swagger2-koa');
const path = require('path');
const logger = require('./logger/Logger').get();
const Config = require('./Config');

Config.init();

const router = require('./Routes');

const app = new Koa();

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

app
  .use(swagger2koa.ui(document, '/openapi'))
  .use(koaLoggerWinston(logger))
  .use(router.routes())
  .use(router.allowedMethods());

// Only start server if launched from Node.js, and not when loaded by another module i.e. used in component tests.
if (!module.parent) {
  app.listen(Config.miraApiPort);
  logger.info(`Listening on port ${Config.miraApiPort}`);
}

module.exports = app;
