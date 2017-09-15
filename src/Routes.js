const EngineDiscovery = require('./EngineDiscovery');
const getOrchestrationClient = require('./orchestration/getOrchestrationClient');
const Config = require('./Config');
const Router = require('koa-router');

const apiVersion = 'v1';
const router = new Router({ prefix: `/${apiVersion}` });

const OrchestrationClient = getOrchestrationClient(Config.mode);
const engineDiscovery = new EngineDiscovery(
  OrchestrationClient,
  Config.engineDiscoveryRefreshRate,
  Config.engineHealthRefreshRate);

const healthEndpoint = 'health';
const enginesEndpoint = 'engines';

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
