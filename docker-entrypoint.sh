#!/bin/bash
# usage: file_env VAR [DEFAULT]
#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)

file_env() {
  local var="$1"
  local fileVar="${var}_FILE"
  local def="${2:-}"
  local val="$def"

#Defaults to enviroment without _FILE if set, else to *_FILE enviroment
  if [ "${!var:-}" ]; then
    val="${!var}"
  elif [ "${!fileVar:-}" ]; then
    val="$(< "${!fileVar}")"
  fi
  export "$var"="$val"
  unset "$fileVar"
}

envs=(
  MIRA_MODE
  MIRA_DISCOVERY_LABEL
  MIRA_DISCOVERY_HOSTNAME
  MIRA_ENGINE_API_PORT_LABEL
  MIRA_ENGINE_METRICS_PORT_LABEL
  MIRA_ENGINE_DISCOVERY_INTERVAL
  MIRA_ENGINE_UPDATE_INTERVAL
  MIRA_KUBERNETES_PROXY_PORT
  MIRA_LOG_LEVEL
  MIRA_ALLOWED_RESPONSE_TIME
  MIRA_SWARM_ENGINES_NETWORKS
  MIRA_ROLLBAR_ACCESS_TOKEN
  MIRA_KUBERNETES_TARGET_NAMESPACE
)

for e in "${envs[@]}"; do
  file_env "$e"
done

exec "$@"
