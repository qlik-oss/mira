FROM node:8-alpine

RUN mkdir -p /app/

# check every 30s to ensure this service returns HTTP 200
RUN apk --update add curl
HEALTHCHECK CMD curl -fs http://localhost:9100/v1/health || exit 1

WORKDIR /app/
COPY package.json ./
COPY src src/
COPY doc/api-doc.yml doc/

RUN npm install --quiet --production
ENTRYPOINT ["node", "./src/index.js"]
