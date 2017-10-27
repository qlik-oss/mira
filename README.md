# Mira - A QIX Engine Discovery Service

**NOTE: This repository is under heavy development**

[![CircleCI](https://circleci.com/gh/qlik-ea/mira.svg?style=svg&circle-token=62ace9e8f1d6ad8bef7ec52b61615217322c63d3)](https://circleci.com/gh/qlik-ea/mira)

## Overview

Mira provides QIX Engine discovery in a Docker containerized environment. Mira is implemented on Node.js and supports different orchestration platforms such as Docker Swarm and Kubernetes. Mira can also operate in a simpler _DNS_ mode and a _Local_ mode.

The documentation in this repository is primarily intended for contributors to Mira development and for those who want to improve Mira by submitting issues.

For Mira's end-user documentation, check out the the [Frontira](https://github.com/qlik-ea/info/tree/master/docs/services/mira) site.

## Contributing

Contributions are welcome and encouraged! See more info at [Open Source at Qlik R&D](https://github.com/qlik-oss/open-source).

## Docker Image

Mira is distributed to end users as a the [qlikea/mira](https://hub.docker.com/r/qlikea/mira) Docker image. Also see the [Dockerfile](./Dockerfile).l

## Running Mira as a Plain Node.js Process

For convenience and development purposes, Mira can be started as a non-Dockerized Node.js process. In this case, Mira would most commonly also be used in _Local_ mode, so the `MIRA_MODE` environment variable should be provided accordingly:

```sh
$ MIRA_MODE=local npm start
```

## Development

### Editor/IDE Configuration

No particular editor or IDE is assumed. The repo root contains an [.editorconfig](./.editorconfig) file for editors that support it. If not, make sure that the used editor is configured accordingly.

### Coding Guidelines

JavaScript code shall be developed according the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

The [eslintrc.json](./eslintrc.json) file incorporates these rules with minor modifications.

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

Unit and component tests can be run with:

```sh
$ npm run test:unit
$ npm run test:component
```

These tests run Mira in isolation and does not depend on any external components.

Integration tests depend on external components. Before they can run, they must be started using the [docker-compose.yml](./docker-compose.yml) file:

```sh
$ docker-compose up -d
$ npm run test:integration
```

To run integration tests towards a specific image tag, provide the `TAG` environment variable to `docker-compose`:

```bash
$ TAG=:<YOUR TAG HERE> docker-compose up -d
$ npm run test:integration
```

See [package.json](./package.json) for more test script variants.

### Releasing

The helper script [release.sh](./release.sh) provides a convenient way to release a new version of the service and to automatically bump versions as needed.

Check usage information in [release.sh](./release.sh) on how to perform the release and version bumping by running:

```
$ release.sh -?
``` 
