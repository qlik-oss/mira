# Mira - A QIX Engine Discovery Service

**NOTE: This repository is under heavy development**

[![CircleCI](https://circleci.com/gh/qlik-ea/mira.svg?style=svg&circle-token=62ace9e8f1d6ad8bef7ec52b61615217322c63d3)](https://circleci.com/gh/qlik-ea/mira)

## Overview

Mira provides QIX Engine discovery in a Docker containerized environment. Mira is implemented on Node.js and supports different orchestration platforms such as Docker Swarm and Kubernetes. Mira can also operate in a simpler _DNS_ mode and a _Local_ mode.

The documentation in this repository is primarily intended for contributors to Mira development and for those who want to improve Mira by submitting issues.

## Contributing

Contributions are welcome and encouraged! See more info at [Open Source at Qlik R&D](https://github.com/qlik-oss/open-source).

## Docker Image

Mira is distributed to end users as a the [qlikea/mira](https://hub.docker.com/r/qlikea/mira) Docker image. Also see the [Dockerfile](./Dockerfile).

To build the image locally, in the repo root run:

```sh
$ docker build -t qlikea/mira:latest .
```

## Running Mira as a Plain Node.js Process

For convenience and development purposes, Mira can be started as a non-Dockerized Node.js process. In this case, Mira would most commonly also be used in _Local_ mode, so the `MIRA_MODE` environment variable should be provided accordingly:

```sh
$ MIRA_MODE=local npm start
```

## Development

### Editor/IDE configuration

No particular editor or IDE is assumed. The repo root contains an [.editorconfig](./.editorconfig) file for editors that support it. If not, make sure that the used editor is configured accordingly.

### Coding Guidelines

JavaScript code shall be developed according the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

The repo root contains the [eslintrc.json](./eslintrc.json) file which incorporates these rules with minor modifications. To lint the code, run:

```sh
$ npm run lint
```

### Install Packages

Once the repo has been cloned, in the repo root, run:

```sh
$ npm install
```

If errors on _node-gyp_ are encoutered on Windows it is due to the [C++ compilation step for Dredd](https://dredd.readthedocs.io/en/latest/installation.html#why-i-m-seeing-node-gyp-errors). This can be avoided by instead using precompiled binaries by running:

```sh
$ npm install --no-optional
```

### Generating the OpenAPI Specification

Mira's REST API is specified in the [api-doc.yml](./doc/api-doc.yml) [OpenAPI](https://www.openapis.org/) document. The OpenAPI specification is generated from JSDoc by running:

```sh
$ npm run generate-openapi
```

### Circle CI

Circle CI is configured to build a new Docker image from all pushed commits on all branches of Mira. As part of this, the built Docker image is pushed to Docker Hub. If pushing to a feature branch (different from `master`), the Docker image is tagged with `<version>-<build-number>`, where `<version>` is fetched from [`package.json`](./package.json), and `<build-number>` is the automatically increased Circle CI build number given to each build. If pushing to `master` the image is also tagged with `latest`.

### Testing

#### Unit Tests

Unit tests run as part of the Circle CI build. To run unit tests locally

```sh
$ npm run test:unit
```

Test coverage lcov and html report will be stored at `./coverage`. In Circle CI the coverage reports will be saved as build artifacts for each build.

#### Component Tests

The component tests executes Mira as a Node.js process and are divided into test suites for each operation mode. Each suite is also part of the job pipeline in Circle CI.

To run component tests for all operation modes

```sh
$ npm run test:component
```

There is also separate npm tasks for running each mode. To run only component tests for local docker mode:

```sh
$ npm run test:component:local
```

and for Docker Swarm:

```sh
$ npm run test:component:swarm
```

For Kubernetes:

```sh
$ npm run test:component:kubernetes
```

#### Integration Tests

Integration tests on a local setup of Mira is part of the Circle CI build pipeline. To run the test cases locally:

```bash
$ docker-compose up -d
$ npm run test:integration
```

To run the tests using a locally build Mira Docker Image, specify the Mira image tag:

```bash
$ TAG=:<VERSION> docker-compose up -d
$ npm run test:integration
```

As part of the integration tests the OpenAPI specification is also validated against the actual API implementation using [Dredd](https://github.com/apiaryio/dredd).

To only execute the Dredd test:

```sh
$ npm run test:integration:dredd
```

### Releasing

The helper script [release.sh](./release.sh) provides a convenient way to release a new version of the service and to automatically bump versions as needed.

Check usage information in [release.sh](./release.sh) on how to perform the release and version bumping by running:

```
$ release.sh -?
``` 
