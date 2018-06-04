const EngineDiscovery = require('./EngineDiscovery');
const getOrchestrationClient = require('./orchestration/getOrchestrationClient');
const Config = require('./Config');
const Router = require('koa-router');
const logger = require('./logger/Logger').get();


const apiVersion = 'v1';
const router = new Router({});

const OrchestrationClient = getOrchestrationClient(Config.mode);
const engineDiscovery = new EngineDiscovery(
  OrchestrationClient,
  Config.engineDiscoveryInterval,
  Config.engineUpdateInterval,
);

engineDiscovery.start();

const healthEndpoint = 'health';
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

// This is just for the swagger generation of the api-doc. The actual /metrics endpoint is defined in the http-metrics-middleware library.
/**
 * @swagger
 * /metrics:
 *   get:
 *     description: Returns metrics of the Mira service
 *     produces:
 *       - application/json
 *       - text/plain; charset=utf-8
 *     responses:
 *       200:
 *         description: successful operation
 *         schema:
 *           type: array
 *           description: Default prometheus client metrics
 */

/**
 * @swagger
 * /v1/engines:
 *   get:
 *     description:  Lists available Qlik Associative Engines.
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
router.get(`/${apiVersion}/${enginesEndpoint}`, async (ctx) => {
  logger.info(`GET /${apiVersion}/${enginesEndpoint}${ctx.querystring ? `?${ctx.querystring}` : ''}`);
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
 *       - networks
 *       - port
 *       - metricsPort
 *       - status
 *     properties:
 *       networks:
 *         description: List of networks for the Qlik Associative Engine
 *         type: array
 *         $ref: '#/definitions/containerNetwork'
 *       port:
 *         description: Port to use when communicating with the Qlik Associative Engine API.
 *         type: number
 *       metricsPort:
 *         description: Port to use when retrieving the Qlik Associative Engine metrics.
 *         type: number
 *       status:
 *         $ref: '#/definitions/containerStatus'
 *       health:
 *          description: Last health endpoint response of the Qlik Associative Engine.
 *          type: object
 *       metrics:
 *          description: Last metrics endpoint response of the Qlik Associative Engine.
 *       labels:
 *          description: Container labels
 *          type: object
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
 *     description: Status of the Qlik Associative Engine.
 *     enum:
 *       - OK
 *       - UNHEALTHY
 *       - NO_METRICS
 *   containerNetwork:
 *     type: object
 *     required:
 *       - ip
 *     properties:
 *       ip:
 *         description: IP address of the Qlik Associative Engine on a specific network
 *         type: string
 *       name:
 *         description: Docker network name
 *         type: string
 */

module.exports = router;
