const logger = require('winston');

const defaultPort = 9100;
const defaultQixEnginePort = 9076;
const defaultQixEngineImageName = 'qlik/engine';

class Config {
  static init(options) {
    Config.port = parseInt(process.env.PORT, 10);
    if (!Config.port || isNaN(Config.port)) {
      Config.port = defaultPort;
    }

    Config.engineImageName = process.env.QIX_ENGINE_IMAGE_NAME;
    if (!Config.engineImageName) {
      Config.engineImageName = defaultQixEngineImageName;
    }

    Config.enginePort = parseInt(process.env.QIX_ENGINE_PORT, 10);
    if (!Config.enginePort || isNaN(Config.enginePort)) {
      Config.enginePort = defaultQixEnginePort;
    }

    Config.mode = options.mode || 'swarm'; // swarm is the default value
    if (Config.mode !== 'local' && Config.mode !== 'swarm') {
      logger.error('Incorrect operation mode. Use --mode option.');
      process.exit(1);
    }
  }
}

module.exports = Config;
