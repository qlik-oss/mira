#!/bin/bash
# Usage:
#   ./build-docker-image -t <docker_tag> -d <dockerfile_dir> <docker_repo>
#     -t <docker_tag>     - the docker tag to use, defaults to 'latest'.
#     -d <dockerfile_dir> - the directory containing the Dockerfile, defaults to the current directory (./).
#     <docker_repo>       - the name of the dockerhub repo. Must be provided.

set -e

print_usage () {
    echo "Usage:"
    echo "  ./build-docker-image -t <docker_tag> -d <dockerfile_dir> <docker_repo>"
    echo "    -t <docker_tag>     - the docker tag to use, defaults to 'latest'."
    echo "    -d <dockerfile_dir> - the directory containing the Dockerfile, defaults to the current directory (./)."
    echo "    <docker_repo>       - the name of the Docker image repo. Must be provided."
}

OPTIND=1
DOCKER_TAG=latest
DOCKERFILE_DIR=.

while getopts t:d: opt; do
    case $opt in
    t)  DOCKER_TAG=$OPTARG
        ;;
    d)  DOCKERFILE_DIR=$OPTARG
        ;;
    \?) print_usage
        exit 1
        ;;
    esac
done

# Shift mass operands to start at $1
shift $((OPTIND - 1))

DOCKER_REPO=$1
if [[ -z "${DOCKER_REPO}" ]]; then
  echo "ERROR! - The docker repo name was not set."
  print_usage
  exit 1
fi

echo "========================================"
echo "Using Docker repo name: $DOCKER_REPO"
echo "Using Docker image tag: $DOCKER_TAG"
echo "Using Dockerfile in directory: $DOCKERFILE_DIR"
echo "========================================"

echo "Creating Node package tarball."
cd $DOCKERFILE_DIR
rm -rf docker_build
mkdir docker_build
cp package.json docker_build
cp -r src docker_build
cp -r doc docker_build
cd docker_build
npm install --quiet --production
tar cfz ../app.tgz *
cd ..

echo "Building the Docker image."
docker build -t $DOCKER_REPO:$DOCKER_TAG .

echo "Cleaning up."
rm ./app.tgz
rm -rf docker_build

echo "Build completed."
