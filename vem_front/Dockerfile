FROM node:20.17.0 AS build

WORKDIR /app
COPY package.json yarn.lock ./

RUN sed -i "s/SET/export/g" package.json

RUN yarn

COPY src ./src
COPY public ./public
COPY .env pre_build.sh ./

RUN chmod +x pre_build.sh && ./pre_build.sh
RUN yarn build

FROM nginx:1.12-alpine

RUN apk add --no-cache bash

COPY --from=build /app/build /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
COPY .env env.sh ./

RUN chmod +x env.sh

EXPOSE 80

CMD ["bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g 'daemon off;'"]