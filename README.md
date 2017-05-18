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
TODO: Link to API spec and API usage.

## Running and Operation Modes
Mira supports different operation modes. The operation mode determines what operations Mira uses to discover QIX Engine instances. This depends on
1. The deployment environment in which QIX Engine instances are running. This operation mode must be explicitly provided when starting Mira. Currently _local_ and _swarm_ deployment environments are supported.
2. Whether Mira itself runs containerized (the standard/most common case), or if Mira is started as a Node.js process "non-Dockerized". Mira detects this operation mode automatically.

### Local Mode
In _local_ mode, Mira assumes that all engine instances run as Docker containers on the `localhost` Docker Engine. _Local_ mode is set by providing the `--mode local` command line argument when starting the Mira Docker container or starting the Node.js process.

The recommended way to start Mira in _local_ mode is through `docker-compose`; for example
```sh
$ docker-compose -f docker-compose.yml up -d
```
The file [docker-compose.yml](./docker-compose.yml) shows an example of this. It starts one Mira container and two engine containers. To verify that Mira discovers the engines, do
```sh
$ curl http://localhost:9100/v1/list
```
which should list the discovery of the two engine containers and return information in JSON format.

### Swarm Mode
In _swarm_ mode, Mira assumes that all engines instances run as Docker Swarm services inside one single Docker Swarm cluster. _Swarm_ mode is set by providing the `--mode local` command line argument when starting the Mira Docker service.

Mira _must_ be configured to run on a Swarm manager node, since it needs to communicate to a manager Docker Engine.

To start Mira in _swarm_ mode, `docker stack` can be used; for example
```sh
$ docker stack deploy -c docker-compose-swarm.yml --with-registry-auth mira
```
The file [docker-compose-swarm.yml](./docker-compose-swarm.yml) shows an example of this. It assumed that a Docker Swarm cluster is already created with at least one manager, and that the Docker CLI client is configured to issue commands towards the manager node. All Swarm services in the example file are configured to run on manager nodes.

### Environment Variables
TODO



## Development

### Contributing
See [CONTRIBUTING.md](doc/CONTRIBUTING.md).

### Editor/IDE configuration
TODO

### Building
TODO

### Testing
TODO

### Coding Guidelines
TODO
