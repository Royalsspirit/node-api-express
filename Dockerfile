FROM node:lts

ENV NODE_ENV production

WORKDIR /app

COPY . .

RUN ls && npm -v && npm install

CMD ["npm","start"]
