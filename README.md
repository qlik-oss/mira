# Mira - a QIX Engine Discovery Service

**NOTE: This repository is under heavy development. Use at own risk!**

## Status

[![CircleCI](https://circleci.com/gh/qlik-ea/mira.svg?style=svg&circle-token=62ace9e8f1d6ad8bef7ec52b61615217322c63d3)](https://circleci.com/gh/qlik-ea/mira)

## Overview

_Mira_ is a microservice exposing a REST API for QIX Engine discovery in a Docker containerized environment. Mira keeps track of QIX Engine containers running in a Docker deployment.

The purpose of the service is mainly for other services to be able to query available QIX Engine instances with certain properties. From this information decisions can be made, e.g. which engine that is suitable to open a new session towards, or if there is a need to start a new QIX Engine in order to serve a client's request to get the QIX Engine resource.

## Docker Image

Mira is distributed as a Docker image built from source in this repository and is available on Docker Hub as [qlikea/mira](https://hub.docker.com/r/qlikea/mira).

## API

_This section remains to be written._

## Discovery

Engine discovery in Mira is based on labeling. Mira assumes that Engine container according some simple rules. Engines that are not labeled, will not be discovered and returned by Mira. Depending on which operation mode Mira runs in (see below) the entities that need to be labeled differs. Since the supported orchestration platforms have similar support, this does not vary too much and it should be fairly easy to translate labeling from one to the other.

Labeling uses a key-value pair. Mira searches for a specific label key to identify engines. By default, this label key is `qix-engine` but can be configured using the `MIRA_DISCOVERY_LABEL` environment variable. Note that Mira only looks at the label key and ignores its value. The values can even be omitted.

## Operation Modes

Mira supports different operation modes. The operation mode determines what operations Mira uses to discover QIX Engine instances. This depends on
1. The orchestration environment in which QIX Engine instances are running. This environment must be explicitly provided when starting Mira. Currently _local_, _swarm_, and _kubernetes_ environments are supported.
2. Whether Mira itself runs containerized (the standard/most common case), or if Mira is started as a Node.js process, "non-Dockerized". Mira detects this operation mode automatically.

### Environment Variables

The following environment variable can optionally be set for Mira

| Name                             | Default value    | Description |
|----------------------------------|------------------|-------------|
| MIRA_API_PORT                    | 9100             | Port on which Mira will expose its REST API. |
| MIRA_DISCOVERY_LABEL             | qix-engine       | Label key that Mira uses to identify engine instances. |
| MIRA_MODE                        | swarm            | The operation mode of mira which can be local, swarm or kubernetes. |
| QIX_ENGINE_API_PORT_LABEL        | qix-engine-port  | Label that Mira will look for on the engines specifying the port to use for communication. |
| QIX_ENGINE_PORT                  | 9076             | Port that Mira will use for QIX Engine communication if it does not find a label on the engine specyfing the port. |
| ENGINE_DISCOVERY_REFRESH_RATE_MS | 1000             | Refresh rate for discovering engines. |
| ENGINE_HEALTH_REFRESH_RATE_MS    | 5000             | Refresh rate for checking if engines are healthy. |
| KUBERNETES_PROXY_PORT            | 8001             | Port that mira will use to talk to kubernetes api server. |

### Local Mode

In _local_ mode, Mira assumes that all engine instances run as Docker containers on the `localhost` Docker Engine, without any orchestration platform such as Docker Swarm or Kubernetes. _Local_ mode is set by providing the `--mode local` command line argument when starting the Mira Docker container or starting the Node.js process.

The recommended way to start Mira in _local_ mode is through a `docker-compose` file; for example

```sh
$ docker-compose up -d
```

The file [docker-compose.yml](./docker-compose.yml) shows an example of this. It starts one Mira container and two engine containers. To verify that Mira discovers the engines, do

```sh
$ curl http://localhost:9100/v1/engines
```

which shall list two engine containers in JSON format.

#### Labeling in local mode

In _local_ mode, Mira assumes that the discovery label is provided on Docker containers. Below is an example extract from a Docker compose file that would cause Mira to discover the `engine1` container.

```yaml
version: "3.1"

services:
  mira:
    image: qlikea/mira
    ...
    environment:
     - MIRA_DISCOVERY_LABEL=qix-engine-prod

  engine1:
    image: qlikea/engine
    ...
    labels:
      qix-engine-prod:

```

Note that the `MIRA_DISCOVERY_LABEL` environment variable provided will override the default label `qix-engine`. Also note how the value can be omitted, Mira will still discover the engine instance.

### Swarm Mode

In _swarm_ mode, Mira assumes that all engines instances run as Docker Swarm services inside one single Docker Swarm cluster. _Swarm_ mode is set by providing the `--mode swarm` command line argument when starting the Mira Docker service.

Mira _must_ be configured to run on a Swarm manager node, since it needs to communicate to a manager Docker Engine.

To start Mira in _swarm_ mode, `docker stack` can be used; for example

```sh
$ docker stack deploy -c docker-compose-swarm.yml --with-registry-auth mira-stack
```

The file [docker-compose-swarm.yml](./swarm/docker-compose-swarm.yml) shows an example of this. It assumed that a Docker Swarm cluster is already created with at least one manager, and that the Docker CLI client is configured to issue commands towards the manager node. All Swarm services in the example file are configured to run on manager nodes.

To remove the stack, run

```sh
$ docker stack rm mira-stack
```

#### Labeling in swarm mode

In _swarm_ mode, Mira assumes that the discovery label is provided on Docker containers. Below is an example extract from a Docker stack file that would cause Mira to discover both Engine replicas as two separate Engine instances of the `engine1` service.

```yaml
version: "3.1"

services:
  mira:
    image: qlikea/mira
    environment:
     - MIRA_DISCOVERY_LABEL=qix-engine-dev
    ...

  engine1:
    image: qlikea/engine
    labels:
      qix-engine-dev:
    deploy:
      replicas: 2
      placement:
        ...

```

Note that in Docker Swarm, the label must be set on container level, _outside_ the `deploy:` scope. Setting the label in the `deploy:` scope causes the label to be set on the service only, and not on each individual container (task) of the service. Only labeling the service will not make Mira discover the engines.

Labeling outside the `deploy:` scope also has the benefit of that the labeling scheme for _local_ and _swarm_ mode becomes similar.

### Kubernetes Mode

In _kubernetes_ mode, Mira assumes that all engine instances are run as Kubernetes pods and that the engines are exposed as Kubernetes services with _named_ ports. _Kubernetes_ mode is set by providing the `--mode kubernetes` command line argument when starting the Mira pod.

Since Mira needs to communicate with the Kubernetes API server, a `kubectl` proxy should be set up in the Kubernetes deployment. A convenient way to do this is to bundle the `kubectl` proxy as a container in the same pod as the Mira container. In this way, Mira can reach the proxy on `localhost`.

In order to deploy Mira and QIX Engine instances to Kubernetes, it is assumed that a Kubernetes cluster exists and is configured properly. The quickest way to do this for development purposes is to use `minikube`. See the [Minikube Mini Tutorial](./doc/MINIKUBE_MINI_TUTORIAL.md) for a quick guide on how to set up a local cluster on your dev machine. After that it should be possible to successfully issue the deployment commands as follows.

To start Mira in _kubernetes_ mode, the `kubectl` command line tool can be used. Preferably, a Kubernetes deployment YAML file is used; for example

```sh
$ kubectl apply -f mira-deployment.yml
```

The file [mira-deployment.yml](./k8s/mira-deployment.yml) shows an example. Note how the deployment also bundles the `kubectl` proxy into the same pod. Since Kubernetes must be able to pull Docker images, the deployment file assumes that Kubernetes is configured with Docker Hub registry credentials in a secret named `dockerhub`.

Normally the Mira REST API shall also be exposed as a service. Preferably, this can also be done by applying the service configuration as a YML file; for example

```sh
$ kubectl apply -f mira-service.yml
```

The file [mira-service.yml](./k8s/mira-service.yml) show an example of this where Mira's default port 9100 is exposed outside the cluster as port 31000 (using the `NodePort` type). Assuming `minikube` is used to create the cluster, the Mira health check should now be possible to reach.

```sh
$ curl http://$(minikube ip):31000/v1/health
```

In order for Mira to discover QIX Engine instances in the cluster, a Kubernetes deployment file can also be used.

```sh
$ kubectl apply -f engine-deployment.yml
```

The file [engine-deployment.yml](./k8s/engine-deployment.yml) shows an example of a deployment of two engine pod replicas. However, this is not enough for Mira to be able to discover the two engine instances. For this to happen, the engines need to be exposed as services with named ports. For example

```sh
$ kubectl apply -f engine-service.yml
```

The file [engine-service.yml](./k8s/engine-service.yml) show as example of how the engine pods are exposed as a service with a named port, `qix`. Each engine replica will appear in the _endpoints_ object that will be related to the service and Mira uses this information to list the engine instances. This list should now be possible to retrieve with

```sh
$ curl http://$(minikube ip):31000/v1/engines
```

Note that the example files here only provide a minimal setup in order to get Mira up and running with Kubernetes. In a production deployment, many other aspects must be considered.

#### Labeling in kubernetes mode

In _kubernetes_ mode, Mira assumes that the discovery label is provided on pods hosting Engine containers. Below is an example extract from a Kubernetes deployment file for two Engine replicas where the label is set up so that Mira can discover them both.

```yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: engine-deployment
spec:
  replicas: 2
  template:
    metadata:
      labels:
        qix-engine:
    spec:
      containers:
        ...
        image: qlikea/engine
        ...      
```

Note that in this case the default value of `qix-engine` is used and the Mira deployment does not need to use the environment variable `MIRA_DISCOVERY_LABEL`.

### Non-Dockerized Node.js process

For convenience and development purposes, Mira can be started as a non-Dockerized Node.js process. The _local_ and _swarm_ modes described above, still apply.

```sh
$ npm start -- --mode local
```

## Development

### Contributing

See [CONTRIBUTING.md](doc/CONTRIBUTING.md).

### Editor/IDE configuration

No particular editor or IDE is assumed. The repo root contains an [.editorconfig](./.editorconfig) file for editors that support it. If not, make sure that the used editor is configured accordingly.

### Building

#### Circle CI

Circle CI is configured to build a new Docker image from all pushed commits on all branches of Mira. As part of this, the built Docker image is pushed to Docker Hub. If pushing to a feature branch (different from `master`), the Docker image is tagged with `<version>-<build-number>`, where `<version>` is fetched from [`package.json`](./package.json), and `<build-number>` is the automatically increased Circle CI build number given to each build. If pushing to `master` the image is also tagged with `latest`.

#### Local machine

If the repo is cloned locally to a dev machine, build the image using the provided [Dockerfile](./Dockerfile), e.g.

```sh
$ docker build -t qlikea/mira:mytag .
```

### Testing

#### Running Unit Tests

Unit tests run as part of the Circle CI build. To run unit tests locally

```sh
$ npm run test:unit
```

Test coverage lcov and html report will be stored at `./coverage`. In Circle CI the coverage reports will be saved as build artifacts for each build.

#### Component Tests

_This section remains to be written._

#### Integration Tests

Integration tests on a local setup of Mira is part of the Circle CI build pipeline. To run the test cases locally:

```bash
$ docker-compose up -d
$ npm run test:integration
```

If you have your locally built mira image and want to test a specific image version:

```bash
$ TAG=:<VERSION> docker-compose up -d
$ npm run test:integration
```

### Coding Guidelines

JavaScript code shall be developed according the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

The repo root contains the [eslintrc.json](./eslintrc.json) file which incorporates these rules with minor modifications.

```sh
$ npm run lint
```

checks sources for lint errors. Builds on Circle CI do not pass if lint errors exist.
