FROM node:dubnium-alpine

RUN mkdir /server
ADD DataCollector.js index.js package.json /server/
ADD public /server/public

WORKDIR /server
RUN npm install --production

CMD ["npm", "start"]
