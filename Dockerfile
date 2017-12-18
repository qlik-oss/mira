# Do the npm install or yarn install in the full image
FROM node:8
WORKDIR /app

# install dependencies before copying src to make use of docker cache layering
COPY package.json ./
COPY package-lock.json ./
RUN npm install --quiet --production

COPY doc/api-doc.yml doc/
COPY src src/

FROM node:8-alpine

WORKDIR /app
COPY --from=0 /app .

RUN apk --update add curl

ARG MIRA_API_PORT=9100
ENV MIRA_API_PORT $MIRA_API_PORT
EXPOSE $MIRA_API_PORT

ENV MIRA_CONTAINERIZED true

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK CMD curl -fs http://localhost:$MIRA_API_PORT/v1/health || exit 1

ENTRYPOINT ["node", "./src/index.js"]
