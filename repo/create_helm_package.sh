#!/bin/bash

PACKAGE_VERSION=$1
CHART_PATH="../examples/kubernetes/helm/charts/mira"

cd "$(dirname "$0")"

# Update helm chart version in example
sed -i '/version/c version: '"$PACKAGE_VERSION" "$CHART_PATH"'/Chart.yaml'

# Create a helm package
helm package -d . --version $PACKAGE_VERSION $CHART_PATH

# Check that packaging was successful
EXIT_CODE=$?
if [[ $EXIT_CODE != 0 ]]; then
  echo "Packaging of Helm chart was not successful, exiting..."
  exit $EXIT_CODE
fi

# Add the new package to index
helm repo index .
