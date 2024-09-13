FROM node:18-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
RUN yarn install
RUN yarn run build

CMD [ "node", "/dist/main.prod.js" ]
