FROM node:7-alpine
RUN mkdir -p /app/qlik/mira
WORKDIR /app/qlik/mira
ADD app.tgz ./
EXPOSE "9100"
ENTRYPOINT ["node", "./src/index.js"]
