# Mira - a QIX Engine Discovery Service
**NOTE: This repository is under heavy development. Use at own risk!**

## Status
[![CircleCI](https://circleci.com/gh/qlik-ea/mira.svg?style=svg&circle-token=62ace9e8f1d6ad8bef7ec52b61615217322c63d3)](https://circleci.com/gh/qlik-ea/mira)

## Overview
_Mira_ is a microservice exposing a REST API for QIX Engine discovery in a Docker containerized environment. Mira keeps track of QIX Engine containers running in a Docker deployment. The purpose of the service is mainly for other services to be able to query for available QIX Engine instances with certain properties and from that information make decisions on, for example, which engine that is suitable to open a new session towards, or if there is a need to start a new QIX Engine in order to serve a client's request to get the QIX Engine resource.

## Docker Image
Mira is distributed as a Docker image built from source in this repository and is available on Docker Hub as [qlikea/mira](https://hub.docker.com/r/qlikea/mira).

## API
TODO: Link to API spec and API usage.

## Running
TODO

### Environment Variables
TODO

## Operation Modes
Mira supports different operation modes. The operation mode determines what operations Mira uses to discover QIX Engine instances. This depends on two different things
1. The deployment environment in which QIX Engine instances are running. This operation mode must be explicitly provided when starting Mira. Currently `local` or `swarm` deployment environments are supported.
2. Whether Mira itself runs containerized (the standard/most common case), or if Mira is started as a Node.js process "non-Dockerized". Mira detects this operation mode automatically.

### Local Mode
In _local_ mode, Mira assumes that all engine instances run as Docker containers the `localhost` Docker Engine. Local mode is set by providing the `--mode local` command line argument when starting the Docker container or starting the Node.js process.

### Swarm Mode
TODO

### Non-supported Modes
TODO

## Development

### Contribution
TODO: Link to Elastic CLA?

### Editor/IDE configuration
TODO

### Building
TODO

### Testing
TODO

### Coding Guidelines
TODO
