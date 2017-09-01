FROM node:8-alpine

RUN apk --update add curl
RUN mkdir -p /app/

ARG MIRA_API_PORT=9100
ENV MIRA_API_PORT $MIRA_API_PORT
EXPOSE $MIRA_API_PORT

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK CMD curl -fs http://localhost:$MIRA_API_PORT/v1/health || exit 1

WORKDIR /app/
COPY package.json ./
COPY src src/
COPY doc/api-doc.yml doc/

RUN npm install --quiet --production
ENTRYPOINT ["node", "./src/index.js"]
