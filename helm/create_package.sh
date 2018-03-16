#!/bin/bash

PACKAGE_VERSION=$1
CHART_PATH="./charts/mira"
EXAMPLE_PATH="../examples/kubernetes/helm"

cd "$(dirname "$0")"

# Update miras helm chart version
sed -i '/version/c version: '"$PACKAGE_VERSION" "$CHART_PATH"'/Chart.yaml'

# Update the required helm chart version in the example
sed -i '/^\([[:space:]]*version: *\).*/s//\1'"$PACKAGE_VERSION"'/' "$EXAMPLE_PATH"'/requirements.yaml'

# Create a helm package
helm package -d ./repo --version $PACKAGE_VERSION $CHART_PATH

# Check that packaging was successful
EXIT_CODE=$?
if [[ $EXIT_CODE != 0 ]]; then
  echo "Packaging of Helm chart was not successful, exiting..."
  exit $EXIT_CODE
fi

# Add the new package to index
helm repo index ./repo
