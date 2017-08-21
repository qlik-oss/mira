FROM node:8-alpine
RUN mkdir -p /app/
WORKDIR /app/
COPY package.json ./
COPY src src/
COPY doc/api-doc.yml doc/
RUN npm install --quiet --production
EXPOSE "9100"
ENTRYPOINT ["node", "./src/index.js"]
