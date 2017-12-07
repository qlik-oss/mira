const EngineDiscovery = require('./EngineDiscovery');
const getOrchestrationClient = require('./orchestration/getOrchestrationClient');
const Config = require('./Config');
const Router = require('koa-router');
const prom = require('prom-client');
const logger = require('./logger/Logger').get();

const apiVersion = 'v1';
const router = new Router({
  prefix: `/${apiVersion}`,
});

const OrchestrationClient = getOrchestrationClient(Config.mode);
const engineDiscovery = new EngineDiscovery(
  OrchestrationClient,
  Config.engineDiscoveryRefreshRate,
  Config.engineHealthRefreshRate);

// Collect default prometheus metrics every 10 seconds
const collectDefaultMetrics = prom.collectDefaultMetrics;
collectDefaultMetrics();

const healthEndpoint = 'health';
const metricsEndpoint = 'metrics';
const enginesEndpoint = 'engines';

/**
 * @swagger
 * /health:
 *   get:
 *     description: Returns health status of the Mira service
 *     produces:
 *       - application/json; charset=utf-8
 *     responses:
 *       200:
 *         description: successful operation
 *         schema:
 *           type: object
 */
router.get(`/${healthEndpoint}`, async (ctx) => {
  logger.debug(`GET /${apiVersion}/${healthEndpoint}`);
  ctx.body = {};
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     description: Returns metrics of the Mira service
 *     produces:
 *       - application/json; charset=utf-8
 *       - text/plain; charset=utf-8
 *     responses:
 *       200:
 *         description: successful operation
 *         schema:
 *           type: array
 *           description: Default prometheus client metrics
 */
router.get(`/${metricsEndpoint}`, async (ctx) => {
  logger.debug(`GET /${apiVersion}/${metricsEndpoint}`);
  if (ctx.accepts('text')) {
    ctx.body = prom.register.metrics();
  } else {
    ctx.body = prom.register.getMetricsAsJSON();
  }
});

/**
 * @swagger
 * /engines:
 *   get:
 *     description:  Lists available QIX Engines in a condensed format.
 *     produces:
 *       - application/json; charset=utf-8
 *     responses:
 *       200:
 *         description: successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/containerInfo'
 */
router.get(`/${enginesEndpoint}`, async (ctx) => {
  logger.info(`GET /${apiVersion}/${enginesEndpoint}`);
  ctx.body = await engineDiscovery.list();
});

/**
 * @swagger
 * /engines/full:
 *   get:
 *     description:  Lists available QIX Engines in a verbose format.
 *     produces:
 *       - application/json; charset=utf-8
 *     responses:
 *       200:
 *         description: successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/containerInfo'
 */
router.get(`/${enginesEndpoint}/full`, async (ctx) => {
  logger.info(`GET /${apiVersion}/${enginesEndpoint}/full`);
  ctx.body = await engineDiscovery.list(true);
});

/**
 * @swagger
 * definitions:
 *   engineInfo:
 *     type: object
 *     properties:
 *       ip:
 *         description: IP address to use when connecting to the QIX Engine.
 *         type: string
 *         required: true
 *       port:
 *         description: Port to use when communicating with the QIX Engine API.
 *         type: number
 *         required: true
 *       metricsPort:
 *         description: Port to use when retrieving the QIX Engine metrics.
 *         type: number
 *         required: true
 *       status:
 *         $ref: '#/definitions/containerStatus'
 *         required: true
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
 *         description: Container information in verbatim format as returned by the Docker Engine Remote API.
 *       swarm:
 *         type: object
 *         description: Task information in verbatim format as returned by the Docker Engine Remote API.
 *       kubernetes:
 *         type: object
 *         description: Pod information in verbatim format as returned by the Kubernetes API.
 *   containerStatus:
 *     type: string
 *     description: Status of the QIX Engine.
 *     enum:
 *       - OK
 *       - UNHEALTHY
 *       - NO_METRICS
 */

module.exports = router;
