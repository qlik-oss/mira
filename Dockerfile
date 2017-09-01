FROM node:8-alpine

RUN apk --update add curl
RUN mkdir -p /app/

ARG PORT=9100
EXPOSE $PORT

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK CMD curl -fs http://localhost:$PORT/v1/health || exit 1

WORKDIR /app/
COPY package.json ./
COPY src src/
COPY doc/api-doc.yml doc/

RUN npm install --quiet --production
ENTRYPOINT ["node", "./src/index.js"]
