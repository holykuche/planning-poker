FROM planning-poker-in-memory-db-proto as db-proto

FROM node:18-alpine

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/proto
WORKDIR /usr/src/app

COPY . /usr/src/app
COPY --from=db-proto . /usr/src/app/proto

RUN yarn install
RUN yarn run build

CMD [ "node", "/dist/main.prod.js" ]
