const Docker = require('dockerode');
const logger = require('winston');
const Config = require('../Config');

const docker = new Docker();

function getProperties(task) {
  return Object.assign({}, task.Spec.ContainerSpec.Labels);
}

function getImageNameOfTask(task) {
  const taskImageName = task.Spec.ContainerSpec.Image;
  const semiColPos = taskImageName.indexOf(':');
  const imageName = (semiColPos >= 0) ? taskImageName.substring(0, semiColPos) : taskImageName;
  return imageName;
}

function getIpAddress(task) {
  if (task.NetworksAttachments) { // This might not be available during startup of a service
                                  // eslint-disable-next-line no-restricted-syntax
    for (const network of task.NetworksAttachments) {
      if (!network.Network.Spec.Ingress) {
        const fullIpAddr = network.Addresses[0];
        const slashPos = fullIpAddr.indexOf('/');
        const ipAddr = (slashPos >= 0) ? fullIpAddr.substring(0, slashPos) : fullIpAddr;
        return ipAddr;
      }
    }
  }
  return undefined;
}

function getNetworks(task) {
  const networks = [];
  if (task.NetworksAttachments) {
    // eslint-disable-next-line no-restricted-syntax
    for (const network of task.NetworksAttachments) {
      networks.push({
        name: network.Network.Spec.Name,
        addresses: network.Addresses
      });
    }
  }
  return networks;
}

function getPublicPort(serviceSpec) {
  if (serviceSpec.Endpoint.Ports) { // Might not be available during startup
    return serviceSpec.Endpoint.Ports[0].PublishedPort;
  }
  return undefined;
}

/**
 * Provides the ability to query the docker environment for available engines
 */
class SwarmDockerClient {
  /**
   * Returns a promise of a list of engines
   * @returns {Promise<Engine>}
   */
  static async listEngines(engineImageName) {
    return new Promise((resolve, reject) => {
      docker.listServices(
        {},
        (err, services) => {
          if (!err) {
            const serviceMap = {};
            for (let i = 0; i < services.length; i += 1) {
              serviceMap[services[i].ID] = services[i];
            }
            docker.listTasks(
              { filters: '{ "desired-state": ["running"] }' },
              (err2, tasks) => {
                if (!err2) {
                  const engineTasks = tasks.filter(task => getImageNameOfTask(task) === engineImageName);
                  const engineInfoEntries = engineTasks.map((task) => {
                    const properties = getProperties(task);
                    const ipAddress = getIpAddress(task);
                    const port = Config.enginePort;
                    const serviceSpec = serviceMap[task.ServiceID];
                    const publicPort = getPublicPort(serviceSpec);
                    const networks = getNetworks(task);
                    return {
                      properties,
                      ipAddress,
                      port,
                      publicPort,
                      networks
                    };
                  });
                  resolve(Promise.all(engineInfoEntries));
                } else {
                  logger.error(err2);
                  reject(err2);
                }
              });
          } else {
            logger.error(err);
            reject(err);
          }
        });
    });
  }
}

module.exports = SwarmDockerClient;
