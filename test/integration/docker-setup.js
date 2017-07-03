const Docker = require('dockerode');
const request = require('superagent');

process.env.DOCKER_HOST = 'localhost:2375';
const docker = new Docker();

const engineServiceSpec = {
  Name: 'mira-integration-test-engine',
  TaskTemplate: {
    ContainerSpec: {
      Image: 'qlik/engine',
      Labels: {
        'qlik.engine.nodeport': '49076',
      },
    },
    Networks: [{ Target: 'mira-integration-test' }],
  },
  EndpointSpec: {
    Ports: [
      {
        Protocol: 'tcp',
        PublishedPort: 49076,
        TargetPort: 9076,
      },
    ],
  },
  Labels: {
    'qlik.engine.nodeport': '49076',
  },
};

async function removeService() {
  const allServices = await docker.listServices();
  const existingServices = allServices.filter(existingServiceSpec =>
    existingServiceSpec.Spec.Name === 'mira-integration-test-engine',
  );

  if (existingServices.length > 0) {
    console.log('Removing engine service');
    await docker.getService(existingServices[0].ID).remove();
    console.log('Removed engine service');
  }
}

async function ok(url) {
  return new Promise((resolve, reject) => {
    async function check(retriesLeft) {
      console.log('Checking ', url);
      try {
        const res = await request.get(url);
        console.log('OK ', url);
        resolve(res);
      } catch (err) {
        console.log('Failed ', url);
        if (retriesLeft > 0) {
          setTimeout(() => check(retriesLeft - 1), 1000);
        } else {
          reject(err);
        }
      }
    }
    check(10);
  });
}

async function nok(url) {
  return new Promise((resolve, reject) => {
    async function check(retriesLeft) {
      console.log('Checking', url);
      try {
        console.log('nok request');
        const res = await request.get(url);
        console.log('Still up ');
        if (retriesLeft > 0) {
          setTimeout(() => check(retriesLeft - 1), 1000);
        } else {
          reject(res);
        }
      } catch (err) {
        console.log('Down ', url);
        resolve('Down');
      }
    }
    check(10);
  });
}

async function startService() {
  console.log('Starting service');
  await docker.createService(engineServiceSpec);
  console.log('Started service');
}

async function awaitService() {
  await ok('http://localhost:49076/healthcheck');
}

async function awaitServiceDown() {
  await nok('http://localhost:49076/healthcheck');
}
module.exports = {
  startService,
  awaitService,
  removeService,
  awaitServiceDown,
};
