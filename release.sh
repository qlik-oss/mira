#!/bin/bash
# Usage:
#   release.sh [major | minor | patch]
#
#   If no argument is passed, it defaults to patch.
#

RELEASE_TYPE=$1
docker run -RELEASE_TYPE -e REPO=qlik-ea/mira -e GITHUB_API_TOKEN -v $HOME/.gitconfig:/root/.gitconfig:ro qlik/cloud-releaser:latest
