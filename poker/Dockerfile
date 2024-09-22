FROM node:18-alpine

ARG POKER_PORT

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN yarn install
RUN yarn run build

EXPOSE $POKER_PORT

CMD [ "node", "./dist/main.prod.js" ]
