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

// Create metric histogram and summary for api response times
const responseTimeHistogram = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: `Time in seconds consumed from ${version.name} receiving a request until a response is sent per path`,
  labelNames: ['path'],
});

const responseTimeSummary = new prom.Summary({
  name: 'http_request_duration_seconds_total',
  help: `Time in seconds consumed from ${version.name} receiving a request until a response is sent in total`,
});

// function for recording time consumed for a request and adding as metric
function recordResponseTimes() {
  return async function responseTime(ctx, next) {
    const requestTime = Date.now();
    await next();
    const diff = Math.ceil((Date.now() - requestTime) / 1000);
    responseTimeSummary.observe(diff);
    responseTimeHistogram.observe({ path: ctx.request.url }, diff);
    if (diff > Config.allowedResponseTime) {
      logger.warn(`Request for endpoint ${ctx.request.url} took ${diff} s, which is longer than allowed ${Config.allowedResponseTime} s`);
    }
  };
}

module.exports = recordResponseTimes;
