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
  Config.engineDiscoveryInterval,
  Config.engineUpdateInterval);

const healthEndpoint = 'health';
const metricsEndpoint = 'metrics';
const enginesEndpoint = 'engines';

// Initialize endpoint counters
const enginesCounter = new prom.Counter({ name: 'mira_api_engines_request_counter', help: 'Number of requests to /engines endpoint' });
const healthCounter = new prom.Counter({ name: 'mira_api_health_request_counter', help: 'Number of requests to /health endpoint' });
const metricsCounter = new prom.Counter({ name: 'mira_api_metrics_request_counter', help: 'Number of requests to /metrics endpoint' });

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
  healthCounter.inc();
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
  metricsCounter.inc();
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
 *     description:  Lists available QIX Engines.
 *     produces:
 *       - application/json; charset=utf-8
 *     parameters:
 *       - name: format
 *         in: query
 *         description: If result should be in full or condensed format.
 *         required: false
 *         type: string
 *         default: full
 *     responses:
 *       200:
 *         description: successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/containerInfo'
 *       503:
 *         description: Service Unavailable
 */
router.get(`/${enginesEndpoint}`, async (ctx) => {
  logger.info(`GET /${apiVersion}/${enginesEndpoint}${ctx.querystring ? `?${ctx.querystring}` : ''}`);
  enginesCounter.inc();
  try {
    ctx.body = await engineDiscovery.list(ctx.query);
  } catch (err) {
    ctx.status = 503;
  }
});

/**
 * @swagger
 * definitions:
 *   engineInfo:
 *     type: object
 *     required:
 *       - ip
 *       - port
 *       - metricsPort
 *       - status
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
 *       - engine
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
