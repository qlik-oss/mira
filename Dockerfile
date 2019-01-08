# Do the npm install on the full image
FROM node:10.15.0 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --quiet --production

COPY doc/api-doc.yml doc/
COPY src src/
COPY version.json ./
COPY docker-entrypoint.sh ./

# Only copy needed pieces from the build step
FROM node:10.15.0-alpine

WORKDIR /app
COPY --from=builder /app .
RUN chmod +x ./docker-entrypoint.sh

RUN apk update && apk add bash && apk add curl && rm -rf /var/cache/apk/*

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK CMD curl -fs http://localhost:$MIRA_API_PORT/health || exit 1

ARG MIRA_API_PORT=9100
ENV MIRA_API_PORT $MIRA_API_PORT
EXPOSE $MIRA_API_PORT

ENV MIRA_CONTAINERIZED true

ENTRYPOINT ["./docker-entrypoint.sh", "node", "./src/index.js"]
