#!/bin/bash

COMMIT_SHA=$(git rev-parse --short HEAD) node -e "console.log(JSON.stringify({ SHA: process.env.COMMIT_SHA, name: require('./package.json').name, version: require('./package.json').version, buildTime: (new Date()).toISOString() }))" > version.json
