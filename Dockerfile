FROM node:dubnium-alpine

RUN mkdir /server
ADD server /server

WORKDIR /server
RUN npm install --production

CMD ["npm", "start"]
