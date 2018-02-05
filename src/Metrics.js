const prom = require('prom-client');
const Config = require('./Config');
const logger = require('./logger/Logger').get();
const version = require('../version');
const os = require('os');

// Create metric gauge containing build info from version.json
new prom.Gauge({
  name: `${version.name}_build_info`,
  help: `A metric with a constant 1 value labeled by version, revision, platform, nodeVersion, os from which ${version.name} was built`,
  labelNames: ['version', 'revision', 'buildTime', 'platform', 'nodeVersion', 'os', 'osRelease'],
}).set({
  version: version.version,
  revision: version.SHA,
  buildTime: version.buildTime,
  platform: process.release.name,
  nodeVersion: process.version,
  os: process.platform,
  osRelease: os.release(),
}, 1);

// Collect default prometheus metrics every 10 seconds
const collectDefaultMetrics = prom.collectDefaultMetrics;
collectDefaultMetrics();

// Create metric summary for api response times
const responseTimeSummary = new prom.Summary({
  name: 'mira_api_response_time_ms',
  help: 'Time in milliseconds consumed from Mira receiving a request until a response is sent',
});

function recordResponseTimes() {
  return function responseTime(ctx, next) {
    const start = Date.now();
    return next().then(() => {
      const diff = Math.ceil(Date.now() - start);
      responseTimeSummary.observe(diff);
      if (diff > Config.allowedResponseTime) {
        logger.warn(`Request for endpoint ${ctx.request.url} took ${diff} ms, which is longer than allowed ${Config.allowedResponseTime} ms`);
      }
    });
  };
}

module.exports = recordResponseTimes;
