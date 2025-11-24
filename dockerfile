FROM node:18-alpine

WORKDIR /usr/src/app/

COPY package*.json ./

RUN npm install --force

COPY ./dist .

ENV NODE_ENV production

EXPOSE 3000

CMD ["node", "main.js"]