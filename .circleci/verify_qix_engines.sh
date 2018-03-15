#!/bin/bash

set +e

# Check that Mira returns correct number of qix engines
MIRA_URL=$1
RETRIES=0
EXPECTED_NBR_ENGINES=2
while (( NBR_ENGINES != "$EXPECTED_NBR_ENGINES" && RETRIES != 30 )); do
  NBR_ENGINES=$(curl "$MIRA_URL/v1/engines" | grep -o \"metricsPort\" | wc -w)
  echo "Mira returned $NBR_ENGINES qix engines"
  sleep 2
  RETRIES=$((RETRIES + 1 ))
done

if [ "$NBR_ENGINES" != "$EXPECTED_NBR_ENGINES" ]; then
  echo "Found $NBR_ENGINES QIX Engines but expected $EXPECTED_NBR_ENGINES"
  exit 1
fi
